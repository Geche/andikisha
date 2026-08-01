package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Null;

/**
 * Body for the admin employee self-setup endpoint (AUTH-BACKLOG-001). Identity fields (email, tenant)
 * come from the gateway-signed headers, never the body — {@code email} and {@code tenantId} are declared
 * only so a body that smuggles them is rejected with 400 rather than silently ignored.
 */
public record SelfSetupRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phoneNumber,
        @Null(message = "email must not be supplied in the request body") String email,
        @Null(message = "tenantId must not be supplied in the request body") String tenantId
) {}
