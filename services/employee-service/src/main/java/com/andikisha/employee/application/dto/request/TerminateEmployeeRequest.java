package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TerminateEmployeeRequest(
        @NotBlank(message = "Termination reason is required")
        @Size(max = 500)
        String reason
) {}
