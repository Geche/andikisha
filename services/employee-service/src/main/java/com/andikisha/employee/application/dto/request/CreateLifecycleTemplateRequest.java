package com.andikisha.employee.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateLifecycleTemplateRequest(
        @NotNull(message = "Workflow type is required")
        String type,

        @NotBlank(message = "Template name is required")
        @Size(max = 150)
        String name,

        List<String> applicableEmploymentTypes,

        @NotEmpty(message = "At least one task definition is required")
        @Valid
        List<LifecycleTaskDefinitionRequest> tasks
) {}
