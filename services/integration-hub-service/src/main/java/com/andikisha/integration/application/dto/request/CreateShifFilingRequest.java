package com.andikisha.integration.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateShifFilingRequest(
        @NotBlank(message = "Period is required (format: YYYY-MM)")
        String period,

        @Positive(message = "Employee count must be positive")
        int employeeCount,

        @NotNull(message = "Total SHIF is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Total SHIF cannot be negative")
        BigDecimal totalShif
) {}
