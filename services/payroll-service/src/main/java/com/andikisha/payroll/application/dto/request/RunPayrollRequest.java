package com.andikisha.payroll.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RunPayrollRequest(
        @NotBlank(message = "Period is required")
        @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Period must be YYYY-MM format")
        String period,

        String payFrequency
) {}