package com.andikisha.tenant.infrastructure.grpc;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.proto.tenant.GetTenantRequest;
import com.andikisha.proto.tenant.TenantResponse;
import com.andikisha.proto.tenant.TenantServiceGrpc;
import com.andikisha.proto.tenant.ValidateLicenceRequest;
import com.andikisha.proto.tenant.ValidateLicenceResponse;
import com.andikisha.proto.tenant.VerifyTenantRequest;
import com.andikisha.proto.tenant.VerifyTenantResponse;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.model.TenantStatus;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@GrpcService
public class TenantGrpcService extends TenantServiceGrpc.TenantServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(TenantGrpcService.class);
    private static final Duration LICENCE_CACHE_TTL = Duration.ofSeconds(60);
    private static final List<LicenceStatus> ACTIVE_LIKE_STATUSES = List.of(
            LicenceStatus.TRIAL, LicenceStatus.ACTIVE,
            LicenceStatus.GRACE_PERIOD, LicenceStatus.SUSPENDED);

    private final TenantService tenantService;
    private final TenantLicenceRepository licenceRepository;
    private final StringRedisTemplate redisTemplate;

    public TenantGrpcService(TenantService tenantService,
                             TenantLicenceRepository licenceRepository,
                             StringRedisTemplate redisTemplate) {
        this.tenantService = tenantService;
        this.licenceRepository = licenceRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void getTenant(GetTenantRequest request,
                          StreamObserver<TenantResponse> observer) {
        if (request.getTenantId() == null || request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            UUID tenantId = UUID.fromString(request.getTenantId());
            com.andikisha.tenant.application.dto.response.TenantResponse tenant =
                    tenantService.getById(tenantId);
            observer.onNext(TenantResponse.newBuilder()
                    .setId(tenant.id().toString())
                    .setName(tenant.companyName())
                    .setPlan(tenant.planName())
                    .setStatus(tenant.status())
                    .setCountry(tenant.country())
                    .setCurrency(tenant.currency())
                    .build());
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id must be a valid UUID").asException());
        } catch (TenantNotFoundException e) {
            observer.onError(Status.NOT_FOUND
                    .withDescription("Tenant not found: " + request.getTenantId())
                    .asException());
        } catch (Exception e) {
            log.error("GetTenant failed", e);
            observer.onError(Status.INTERNAL
                    .withDescription("Internal error").asException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void verifyTenantActive(VerifyTenantRequest request,
                                   StreamObserver<VerifyTenantResponse> observer) {
        if (request.getTenantId() == null || request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            UUID tenantId = UUID.fromString(request.getTenantId());
            com.andikisha.tenant.application.dto.response.TenantResponse tenant =
                    tenantService.getById(tenantId);
            boolean active = isActiveTenant(tenant);
            observer.onNext(VerifyTenantResponse.newBuilder()
                    .setActive(active)
                    .setPlan(active ? tenant.planName() : "")
                    .build());
            observer.onCompleted();
        } catch (TenantNotFoundException e) {
            observer.onNext(VerifyTenantResponse.newBuilder().setActive(false).build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("VerifyTenantActive failed", e);
            observer.onNext(VerifyTenantResponse.newBuilder().setActive(false).build());
            observer.onCompleted();
        } finally {
            TenantContext.clear();
        }
    }

    private boolean isActiveTenant(com.andikisha.tenant.application.dto.response.TenantResponse tenant) {
        String status = tenant.status();
        if (TenantStatus.ACTIVE.name().equals(status)) {
            return true;
        }
        if (TenantStatus.TRIAL.name().equals(status)) {
            LocalDate trialEndsAt = tenant.trialEndsAt();
            return trialEndsAt == null || !LocalDate.now().isAfter(trialEndsAt);
        }
        return false;
    }

    /**
     * Resolve the tenant's current licence and translate it into the
     * gRPC-level access decision used by every other service before
     * accepting writes.
     *
     * Mapping (writes_allowed):
     *   TRIAL/ACTIVE          -> read+write
     *   GRACE_PERIOD          -> read+write (warning shown by gateway)
     *   SUSPENDED             -> read-only
     *   EXPIRED/CANCELLED     -> no access
     *   no licence at all     -> no access
     */
    @Override
    public void validateTenantLicence(ValidateLicenceRequest request,
                                      StreamObserver<ValidateLicenceResponse> observer) {
        if (request.getTenantId() == null || request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }

        String tenantIdStr = request.getTenantId();
        try {
            TenantContext.setTenantId(tenantIdStr);
            Optional<TenantLicence> maybeLicence = licenceRepository
                    .findByTenantIdAndStatusIn(tenantIdStr, ACTIVE_LIKE_STATUSES);

            ValidateLicenceResponse response = maybeLicence
                    .map(this::buildResponse)
                    .orElse(buildNoLicenceResponse());

            // Cache the result so the next request from the gateway can
            // short-circuit without an RPC call.
            try {
                redisTemplate.opsForValue().set(
                        RedisKeys.licenceStatus(tenantIdStr),
                        response.getLicenceStatus(),
                        LICENCE_CACHE_TTL);
            } catch (Exception cacheEx) {
                log.warn("Failed to cache licence status for tenant {}: {}",
                        tenantIdStr, cacheEx.getMessage());
            }

            observer.onNext(response);
            observer.onCompleted();
        } catch (Exception e) {
            log.error("ValidateTenantLicence failed for tenant {}", tenantIdStr, e);
            observer.onError(Status.INTERNAL
                    .withDescription("Internal error").asException());
        } finally {
            TenantContext.clear();
        }
    }

    private ValidateLicenceResponse buildResponse(TenantLicence licence) {
        LicenceStatus status = licence.getStatus();
        boolean accessAllowed;
        boolean writesAllowed;
        String restriction;
        switch (status) {
            case TRIAL, ACTIVE -> {
                accessAllowed = true;
                writesAllowed = true;
                restriction = "";
            }
            case GRACE_PERIOD -> {
                accessAllowed = true;
                writesAllowed = true;
                restriction = "Licence in grace period — renew to avoid suspension";
            }
            case SUSPENDED -> {
                accessAllowed = true;
                writesAllowed = false;
                restriction = "Licence suspended — read-only access";
            }
            default -> {
                accessAllowed = false;
                writesAllowed = false;
                restriction = "Licence " + status;
            }
        }
        return ValidateLicenceResponse.newBuilder()
                .setAccessAllowed(accessAllowed)
                .setLicenceStatus(status.name())
                .setWritesAllowed(writesAllowed)
                .setRestrictionReason(restriction)
                .setLicenceExpiryDate(licence.getEndDate() != null
                        ? licence.getEndDate().toString() : "")
                .build();
    }

    private ValidateLicenceResponse buildNoLicenceResponse() {
        return ValidateLicenceResponse.newBuilder()
                .setAccessAllowed(false)
                .setLicenceStatus("NONE")
                .setWritesAllowed(false)
                .setRestrictionReason("No active licence found for tenant")
                .setLicenceExpiryDate("")
                .build();
    }
}
