package com.andikisha.auth.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record SuperAdminSessionResponse(
    UUID id,
    Instant createdAt,
    Instant expiresAt,
    String ipAddress,
    String userAgent,
    boolean current
) {}
