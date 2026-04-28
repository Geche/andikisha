package com.andikisha.auth.application.dto.response;

import java.time.Instant;

public record UssdSessionResponse(
        String sessionToken,
        Instant expiresAt
) {}
