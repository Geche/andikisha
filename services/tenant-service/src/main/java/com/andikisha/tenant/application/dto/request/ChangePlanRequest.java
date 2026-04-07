package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChangePlanRequest(
        @NotBlank(message = "Plan name is required")
        String planName
) {}
