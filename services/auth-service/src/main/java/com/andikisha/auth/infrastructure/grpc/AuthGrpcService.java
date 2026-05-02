package com.andikisha.auth.infrastructure.grpc;

import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.proto.auth.AuthServiceGrpc;
import com.andikisha.proto.auth.CheckPermissionRequest;
import com.andikisha.proto.auth.CheckPermissionResponse;
import com.andikisha.proto.auth.GetUserByEmployeeIdRequest;
import com.andikisha.proto.auth.ProvisionTenantAdminRequest;
import com.andikisha.proto.auth.ProvisionTenantAdminResponse;
import com.andikisha.proto.auth.ValidateTokenRequest;
import com.andikisha.proto.auth.ValidateTokenResponse;
import com.andikisha.proto.auth.ValidateUssdSessionRequest;
import com.andikisha.proto.auth.ValidateUssdSessionResponse;
import io.grpc.stub.StreamObserver;
import io.jsonwebtoken.Claims;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

@GrpcService
public class AuthGrpcService extends AuthServiceGrpc.AuthServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(AuthGrpcService.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthService authService;
    private final com.andikisha.auth.domain.repository.UssdSessionRepository ussdSessionRepository;

    public AuthGrpcService(JwtTokenProvider jwtTokenProvider, AuthService authService,
                           com.andikisha.auth.domain.repository.UssdSessionRepository ussdSessionRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.authService = authService;
        this.ussdSessionRepository = ussdSessionRepository;
    }

    @Override
    public void validateToken(ValidateTokenRequest request,
                              StreamObserver<ValidateTokenResponse> observer) {
        try {
            if (!jwtTokenProvider.validateToken(request.getToken())) {
                observer.onNext(ValidateTokenResponse.newBuilder().setValid(false).build());
                observer.onCompleted();
                return;
            }

            Claims claims = jwtTokenProvider.getClaims(request.getToken());

            ValidateTokenResponse.Builder response = ValidateTokenResponse.newBuilder()
                    .setValid(true)
                    .setUserId(claims.getSubject())
                    .setTenantId(claims.get("tenantId", String.class))
                    .setRole(claims.get("role", String.class))
                    .setEmail(claims.get("email", String.class));

            String employeeId = claims.get("employeeId", String.class);
            if (employeeId != null) {
                response.setEmployeeId(employeeId);
            }

            observer.onNext(response.build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("Token validation failed", e);
            observer.onNext(ValidateTokenResponse.newBuilder().setValid(false).build());
            observer.onCompleted();
        }
    }

    @Override
    public void checkPermission(CheckPermissionRequest request,
                                StreamObserver<CheckPermissionResponse> observer) {
        if (request.getTenantId() == null || request.getTenantId().isBlank()) {
            observer.onError(io.grpc.Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            boolean allowed = authService.checkPermission(
                    request.getTenantId(),
                    UUID.fromString(request.getUserId()),
                    request.getResource(),
                    request.getAction(),
                    request.getScope()
            );
            observer.onNext(CheckPermissionResponse.newBuilder().setAllowed(allowed).build());
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(io.grpc.Status.INVALID_ARGUMENT
                    .withDescription("user_id must be a valid UUID").asException());
        } catch (Exception e) {
            log.error("Permission check failed", e);
            observer.onNext(CheckPermissionResponse.newBuilder().setAllowed(false).build());
            observer.onCompleted();
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getUserByEmployeeId(GetUserByEmployeeIdRequest request,
                                    StreamObserver<com.andikisha.proto.auth.UserResponse> observer) {
        if (request.getTenantId() == null || request.getTenantId().isBlank()) {
            observer.onError(io.grpc.Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            UserResponse user = authService.getUserByEmployeeId(
                    request.getTenantId(),
                    UUID.fromString(request.getEmployeeId())
            );
            observer.onNext(com.andikisha.proto.auth.UserResponse.newBuilder()
                    .setUserId(user.id().toString())
                    .setTenantId(user.tenantId())
                    .setEmail(user.email())
                    .setRole(user.role())
                    .setEmployeeId(user.employeeId() != null ? user.employeeId().toString() : "")
                    .setIsActive(user.active())
                    .build());
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(io.grpc.Status.INVALID_ARGUMENT
                    .withDescription("employee_id must be a valid UUID").asException());
        } catch (ResourceNotFoundException e) {
            observer.onError(io.grpc.Status.NOT_FOUND
                    .withDescription(e.getMessage()).asException());
        } catch (Exception e) {
            log.error("GetUserByEmployeeId failed", e);
            observer.onError(io.grpc.Status.INTERNAL
                    .withDescription("Internal error").asException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void validateUssdSession(ValidateUssdSessionRequest request,
                                    StreamObserver<ValidateUssdSessionResponse> observer) {
        try {
            if (!jwtTokenProvider.validateToken(request.getSessionToken())) {
                observer.onNext(ValidateUssdSessionResponse.newBuilder()
                        .setValid(false)
                        .setInvalidationReason("TOKEN_INVALID_OR_EXPIRED")
                        .build());
                observer.onCompleted();
                return;
            }

            Claims claims = jwtTokenProvider.getClaims(request.getSessionToken());
            String sessionType = claims.get("sessionType", String.class);

            if (!"USSD".equals(sessionType)) {
                observer.onNext(ValidateUssdSessionResponse.newBuilder()
                        .setValid(false)
                        .setInvalidationReason("NOT_A_USSD_TOKEN")
                        .build());
                observer.onCompleted();
                return;
            }

            String tokenMsisdn = claims.getSubject();
            if (!request.getMsisdn().equals(tokenMsisdn)) {
                observer.onNext(ValidateUssdSessionResponse.newBuilder()
                        .setValid(false)
                        .setInvalidationReason("MSISDN_MISMATCH")
                        .build());
                observer.onCompleted();
                return;
            }

            String employeeId = claims.get("employeeId", String.class);
            String tenantId = claims.get("tenantId", String.class);

            observer.onNext(ValidateUssdSessionResponse.newBuilder()
                    .setValid(true)
                    .setEmployeeId(employeeId != null ? employeeId : "")
                    .setTenantId(tenantId != null ? tenantId : "")
                    .build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("ValidateUssdSession failed", e);
            observer.onNext(ValidateUssdSessionResponse.newBuilder()
                    .setValid(false)
                    .setInvalidationReason("INTERNAL_ERROR")
                    .build());
            observer.onCompleted();
        }
    }

    @Override
    public void provisionTenantAdmin(ProvisionTenantAdminRequest request,
                                     StreamObserver<ProvisionTenantAdminResponse> observer) {
        try {
            String userId = authService.provisionTenantAdmin(
                    request.getTenantId(),
                    request.getEmail(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getPhone(),
                    request.getTemporaryPassword()
            );
            observer.onNext(ProvisionTenantAdminResponse.newBuilder()
                    .setUserId(userId)
                    .setEmail(request.getEmail())
                    .build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("Failed to provision tenant admin for tenantId={}", request.getTenantId(), e);
            observer.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }
}
