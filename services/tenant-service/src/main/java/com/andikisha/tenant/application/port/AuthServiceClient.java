package com.andikisha.tenant.application.port;

/**
 * Outbound port to Auth Service.
 *
 * Used during super-admin provisioning to bootstrap the first admin user
 * for a brand-new tenant. Real implementation will be a gRPC client; for
 * now a stub @Component implements this without performing any side effects.
 */
public interface AuthServiceClient {

    /**
     * Provision the initial tenant admin user in Auth Service.
     *
     * @param tenantId          new tenant id
     * @param email             admin login email
     * @param firstName         admin first name
     * @param lastName          admin last name
     * @param phone             admin phone
     * @param temporaryPassword one-time password the user must change on first login
     */
    void provisionInitialAdmin(String tenantId,
                               String email,
                               String firstName,
                               String lastName,
                               String phone,
                               String temporaryPassword);
}
