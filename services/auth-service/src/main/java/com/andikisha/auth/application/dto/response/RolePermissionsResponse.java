package com.andikisha.auth.application.dto.response;

import java.util.List;

/**
 * Read-only projection of what a role is granted, sourced from the
 * {@code role_permissions} table — the single source of truth the services
 * enforce. Permission strings are {@code resource:action:scope}.
 */
public record RolePermissionsResponse(
        String role,
        List<String> permissions
) {}
