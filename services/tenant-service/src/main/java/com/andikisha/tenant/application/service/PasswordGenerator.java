package com.andikisha.tenant.application.service;

import org.springframework.stereotype.Component;

/**
 * Delegates to the shared PasswordGenerator in andikisha-common.
 * Kept as a Spring bean so SuperAdminTenantService injection is unchanged.
 */
@Component
public class PasswordGenerator {

    public String generate() {
        return com.andikisha.common.util.PasswordGenerator.generate();
    }
}
