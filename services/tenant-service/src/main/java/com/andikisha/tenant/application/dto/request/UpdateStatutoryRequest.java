package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Update a tenant's organisation-level statutory registrations.
 *
 * KRA PIN format (one letter + 9 digits + one letter, e.g. A123456789X) is validated
 * to match the client form and CreateEmployeeRequest (TENANT-BACKLOG-004). Optional:
 * null or empty clears the field; a non-empty value must match.
 */
public record UpdateStatutoryRequest(
        @Pattern(regexp = "^([A-Z]\\d{9}[A-Z])?$", message = "Invalid KRA PIN format (e.g. A123456789X)")
        String kraPin,

        @Size(max = 20, message = "NSSF number must not exceed 20 characters")
        String nssfNumber,

        @Size(max = 20, message = "SHIF number must not exceed 20 characters")
        String shifNumber
) {}
