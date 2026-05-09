package com.andikisha.payroll.application.dto.request;

import jakarta.validation.constraints.Size;

public record CancelPayrollRequest(
        @Size(max = 500, message = "Reason must not exceed 500 characters")
        String reason
) {}
