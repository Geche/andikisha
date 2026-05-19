package com.andikisha.tenant.application.dto.response;

public record AdminPasswordResetResponse(
        String tenantId,
        String adminEmail,
        String temporaryPassword
) {}
