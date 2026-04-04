package com.andikisha.auth.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String tenantId,
        String email,
        String phoneNumber,
        String role,
        UUID employeeId,
        boolean active,
        LocalDateTime lastLogin,
        LocalDateTime createdAt
) {}