package com.andikisha.tenant.infrastructure.grpc;

import com.andikisha.tenant.application.port.AuthServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Stub implementation of {@link AuthServiceClient}.
 *
 * TODO: replace with a real gRPC client (auth-service:9081) once the
 * AuthService.RegisterUser RPC contract is finalised. The contract must
 * accept a temporary password, a "must change on first login" flag, and
 * return the newly-created userId.
 *
 * Until then this stub simply logs the call so super-admin tenant
 * provisioning is exercised end-to-end without an external dependency.
 */
@Component
public class NoOpAuthServiceClient implements AuthServiceClient {

    private static final Logger log = LoggerFactory.getLogger(NoOpAuthServiceClient.class);

    @Override
    public void provisionInitialAdmin(String tenantId,
                                      String email,
                                      String firstName,
                                      String lastName,
                                      String phone,
                                      String temporaryPassword) {
        // TODO: replace with real gRPC call to auth-service.RegisterUser
        log.debug("[STUB] AuthServiceClient.provisionInitialAdmin called for tenant={} email={}. "
                + "Real Auth Service integration is not wired yet.",
                tenantId, email);
    }
}
