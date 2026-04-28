package com.andikisha.auth.application.dto.response;

public record SuperAdminTokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String role,
        String tenantId
) {}
