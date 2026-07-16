package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record LifecycleTaskDefinitionRequest(
        @NotBlank(message = "Task title is required")
        @Size(max = 200)
        String title,

        @Size(max = 1000)
        String description,

        @NotNull(message = "Assignee role is required")
        String assigneeRole,

        @NotNull(message = "Completion type is required")
        String completionType,

        @PositiveOrZero(message = "Due offset days cannot be negative")
        Integer dueOffsetDays
) {}
