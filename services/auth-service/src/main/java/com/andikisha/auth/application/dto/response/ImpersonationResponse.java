package com.andikisha.auth.application.dto.response;

import java.time.Instant;

public record ImpersonationResponse(
        String impersonationToken,
        Instant expiresAt,
        String targetTenantId
) {}
