package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDepartmentRequest(
        @NotBlank(message = "Department name is required")
        @Size(max = 100)
        String name,

        @Size(max = 500)
        String description
) {}
