package com.andikisha.audit.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AuditEntryResponse(
        UUID id,
        String domain,
        String action,
        String resourceType,
        String resourceId,
        String actorId,
        String actorName,
        String description,
        String eventType,
        Instant occurredAt,
        Instant recordedAt
) {}