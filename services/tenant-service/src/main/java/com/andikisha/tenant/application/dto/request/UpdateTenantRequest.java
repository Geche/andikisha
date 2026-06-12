package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateTenantRequest(
        @Size(max = 200)
        String companyName,

        // KRA PIN: one letter + 9 digits + one letter (e.g. A123456789X); optional (TENANT-BACKLOG-004).
        @Pattern(regexp = "^([A-Z]\\d{9}[A-Z])?$", message = "Invalid KRA PIN format (e.g. A123456789X)")
        String kraPin,

        String nssfNumber,

        String shifNumber,

        @Pattern(regexp = "MONTHLY|WEEKLY|BI_WEEKLY",
                 message = "payFrequency must be one of: MONTHLY, WEEKLY, BI_WEEKLY")
        String payFrequency,

        @Min(value = 1, message = "Pay day must be between 1 and 28")
        @Max(value = 28, message = "Pay day must be between 1 and 28")
        Integer payDay
) {}