package com.andikisha.tenant.infrastructure.grpc;

import com.andikisha.proto.auth.AuthServiceGrpc;
import com.andikisha.proto.auth.ProvisionTenantAdminRequest;
import com.andikisha.tenant.application.port.AuthServiceClient;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AuthServiceGrpcClient implements AuthServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceGrpcClient.class);

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub authStub;

    @Override
    public void provisionInitialAdmin(String tenantId, String email,
                                      String firstName, String lastName,
                                      String phone, String temporaryPassword) {
        log.info("Provisioning initial admin in auth-service for tenantId={} email={}", tenantId, email);
        try {
            authStub.provisionTenantAdmin(
                    ProvisionTenantAdminRequest.newBuilder()
                            .setTenantId(tenantId)
                            .setEmail(email)
                            .setFirstName(firstName)
                            .setLastName(lastName)
                            .setPhone(phone)
                            .setTemporaryPassword(temporaryPassword)
                            .build()
            );
            log.info("Auth service provisioned admin for tenantId={}", tenantId);
        } catch (Exception e) {
            log.error("Failed to provision auth user for tenantId={}", tenantId, e);
            throw new RuntimeException("Tenant admin provisioning failed — check auth-service. tenantId=" + tenantId, e);
        }
    }
}
