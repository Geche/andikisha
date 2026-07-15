package com.andikisha.employee.application.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record LifecycleTaskResponse(
        UUID id,
        String title,
        String description,
        String assigneeRole,
        LocalDate dueDate,
        String status,
        String completionType,
        String completedBy,
        Instant completedAt,
        UUID documentId
) {}
