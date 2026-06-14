package com.andikisha.auth.application.service;

import com.andikisha.auth.application.dto.response.RolePermissionsResponse;
import com.andikisha.auth.application.dto.response.TenantUserResponse;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.repository.RolePermissionRepository;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.common.tenant.TenantContext;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read-only projections for the central roles & permissions screen (R2-8).
 * The permission matrix is sourced from {@code role_permissions} — the table the
 * services actually enforce — never hardcoded, so it can't drift from enforcement.
 */
@Service
@Transactional(readOnly = true)
public class RolePermissionQueryService {

    // RBAC grants are seeded globally under the SYSTEM tenant (same template for
    // every tenant) and enforcement reads them from there — so the matrix must
    // read SYSTEM too, not the caller's tenant, or it would show an empty grid.
    private static final String RBAC_TENANT = "SYSTEM";

    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;

    public RolePermissionQueryService(RolePermissionRepository rolePermissionRepository,
                                      UserRepository userRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRepository = userRepository;
    }

    /** Role -> granted permission strings ({@code resource:action:scope}), read-only.
     *  Sourced from the SYSTEM-tenant RBAC template (what enforcement reads). */
    public List<RolePermissionsResponse> listRolePermissions() {
        return Role.OPERATIONAL.stream()
                .map(role -> new RolePermissionsResponse(
                        role.name(),
                        rolePermissionRepository
                                .findPermissionStringsByTenantIdAndRole(RBAC_TENANT, role)
                                .stream().sorted().toList()))
                .toList();
    }

    /** All users in the tenant with their current role, for central assignment. */
    public List<TenantUserResponse> listTenantUsers() {
        String tenantId = TenantContext.requireTenantId();
        return userRepository.findByTenantId(tenantId, Pageable.unpaged())
                .stream()
                .map(u -> new TenantUserResponse(
                        u.getId().toString(),
                        u.getEmail(),
                        u.getDisplayName(),
                        u.getRole().name(),
                        u.getEmployeeId() != null ? u.getEmployeeId().toString() : null,
                        u.getLastLogin() != null ? u.getLastLogin().toString() : null))
                .toList();
    }
}
