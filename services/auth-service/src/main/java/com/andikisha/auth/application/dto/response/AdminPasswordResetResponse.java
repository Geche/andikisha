package com.andikisha.auth.application.dto.response;

public record AdminPasswordResetResponse(
        String userId,
        String email,
        String temporaryPassword) {}
