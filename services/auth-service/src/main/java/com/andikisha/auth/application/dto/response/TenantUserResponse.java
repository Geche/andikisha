package com.andikisha.auth.application.dto.response;

/**
 * Minimal user projection for the central role-management screen:
 * who exists in the tenant and what role they currently hold.
 */
public record TenantUserResponse(
        String id,
        String email,
        String displayName,
        String role,
        String employeeId,
        String lastLogin,
        boolean active
) {}
