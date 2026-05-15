package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePositionRequest(
        @NotBlank(message = "Position title is required")
        @Size(max = 100)
        String title,

        @Size(max = 500)
        String description,

        @Size(max = 20)
        String gradeLevel
) {}
