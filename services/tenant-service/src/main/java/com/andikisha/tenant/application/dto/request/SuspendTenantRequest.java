package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SuspendTenantRequest(
        @NotBlank(message = "Suspension reason is required")
        @Size(max = 500)
        String reason
) {}
