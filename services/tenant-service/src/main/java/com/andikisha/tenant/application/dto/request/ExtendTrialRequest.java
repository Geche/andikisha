package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ExtendTrialRequest(
        @Min(value = 1, message = "Additional days must be at least 1")
        @Max(value = 90, message = "Cannot extend trial by more than 90 days")
        int additionalDays
) {}
