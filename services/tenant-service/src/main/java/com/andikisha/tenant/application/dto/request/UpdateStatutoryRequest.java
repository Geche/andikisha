package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Update a tenant's organisation-level statutory registrations.
 *
 * NOTE: KRA PIN format is validated on the client form (A123456789X). Backend
 * format validation for these fields is an existing gap across tenant statutory
 * handling and is tracked as backlog (TENANT-BACKLOG-004) rather than added here
 * unilaterally — see that item.
 */
public record UpdateStatutoryRequest(
        @Size(max = 20, message = "KRA PIN must not exceed 20 characters")
        String kraPin,

        @Size(max = 20, message = "NSSF number must not exceed 20 characters")
        String nssfNumber,

        @Size(max = 20, message = "SHIF number must not exceed 20 characters")
        String shifNumber
) {}
