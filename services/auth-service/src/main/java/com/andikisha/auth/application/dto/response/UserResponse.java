package com.andikisha.auth.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String tenantId,
        String email,
        String displayName,
        String phoneNumber,
        String role,
        UUID employeeId,
        boolean active,
        boolean mustChangePassword,
        LocalDateTime lastLogin,
        LocalDateTime createdAt
) {}