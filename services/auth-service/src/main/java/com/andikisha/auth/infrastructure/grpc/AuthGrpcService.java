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
import com.andikisha.proto.auth.ValidateTokenRequest;
import com.andikisha.proto.auth.ValidateTokenResponse;
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

    public AuthGrpcService(JwtTokenProvider jwtTokenProvider, AuthService authService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.authService = authService;
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
}
