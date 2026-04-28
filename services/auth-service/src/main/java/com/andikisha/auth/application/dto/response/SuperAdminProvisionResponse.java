package com.andikisha.auth.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record SuperAdminProvisionResponse(
        UUID userId,
        String email,
        String role,
        LocalDateTime createdAt
) {}
