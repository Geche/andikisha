package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.response.RolePermissionsResponse;
import com.andikisha.auth.application.dto.response.TenantUserResponse;
import com.andikisha.auth.application.service.RolePermissionQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only role/permission views for the tenant-admin roles screen (R2-8).
 * Assignment itself reuses the existing {@code PATCH /users/{id}/role}.
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Roles & Permissions", description = "Read-only role/permission views for tenant admins")
public class RoleController {

    private final RolePermissionQueryService queryService;

    public RoleController(RolePermissionQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Role to permissions matrix (read-only, projected from role_permissions)")
    public List<RolePermissionsResponse> listRoles() {
        return queryService.listRolePermissions();
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Tenant users with their current role (for central role assignment)")
    public List<TenantUserResponse> listUsers() {
        return queryService.listTenantUsers();
    }
}
