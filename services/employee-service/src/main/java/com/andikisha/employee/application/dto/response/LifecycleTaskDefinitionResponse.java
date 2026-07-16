package com.andikisha.employee.application.dto.response;

import java.util.UUID;

public record LifecycleTaskDefinitionResponse(
        UUID id,
        int orderIndex,
        String title,
        String description,
        String assigneeRole,
        String completionType,
        Integer dueOffsetDays
) {}
