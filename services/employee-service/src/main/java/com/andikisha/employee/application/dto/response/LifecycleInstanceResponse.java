package com.andikisha.employee.application.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record LifecycleInstanceResponse(
        UUID id,
        UUID employeeId,
        UUID templateId,
        String type,
        String status,
        Instant startedAt,
        Instant completedAt,
        String initiatedBy,
        String systemNote,
        int completedTaskCount,
        int totalTaskCount,
        List<LifecycleTaskResponse> tasks
) {}
