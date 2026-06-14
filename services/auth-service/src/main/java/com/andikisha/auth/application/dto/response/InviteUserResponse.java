package com.andikisha.auth.application.dto.response;

/**
 * R3-2c: result of inviting a standalone user. The temporary password is returned once
 * (shown in the UI per the AUTH-006 admin-reset pattern — no email infrastructure yet).
 */
public record InviteUserResponse(
        String userId,
        String email,
        String role,
        String temporaryPassword) {}
