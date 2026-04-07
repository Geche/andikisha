package com.andikisha.tenant.infrastructure.grpc;

import com.andikisha.proto.tenant.GetTenantRequest;
import com.andikisha.proto.tenant.TenantResponse;
import com.andikisha.proto.tenant.TenantServiceGrpc;
import com.andikisha.proto.tenant.VerifyTenantRequest;
import com.andikisha.proto.tenant.VerifyTenantResponse;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.andikisha.tenant.domain.model.TenantStatus;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.UUID;

@GrpcService
public class TenantGrpcService extends TenantServiceGrpc.TenantServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(TenantGrpcService.class);
    private final TenantService tenantService;

    public TenantGrpcService(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Override
    public void getTenant(GetTenantRequest request,
                          StreamObserver<TenantResponse> observer) {
        try {
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
        } catch (TenantNotFoundException e) {
            observer.onError(Status.NOT_FOUND
                    .withDescription("Tenant not found: " + request.getTenantId())
                    .asException());
        } catch (Exception e) {
            log.error("GetTenant failed", e);
            observer.onError(Status.INTERNAL
                    .withDescription("Internal error").asException());
        }
    }

    @Override
    public void verifyTenantActive(VerifyTenantRequest request,
                                   StreamObserver<VerifyTenantResponse> observer) {
        try {
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
}
