package com.andikisha.auth.domain.model;

public enum Role {

    // Platform-level
    SUPER_ADMIN,

    // HR & Administration
    ADMIN,
    HR_MANAGER,
    HR_OFFICER,

    // Payroll & Finance
    PAYROLL_MANAGER,
    PAYROLL_OFFICER,
    FINANCE_OFFICER, // Reserved for future use

    // Management
    LINE_MANAGER,
    CHIEF_MANAGER,   // Reserved for future use
    CHIEF_OFFICER,   // Reserved for future use

    // Audit & Integration
    AUDITOR,         // Reserved for future use

    // Self-service
    EMPLOYEE;

    /**
     * Tenant-assignable operational roles, in display order. The single source of
     * truth for which roles are enforced and may be assigned to a tenant user.
     * Excludes SUPER_ADMIN (platform-only) and the reserved/future roles, which
     * have no enforcement and must not be offered or assigned (R3-0).
     * Callers: {@code RolePermissionQueryService} (matrix display) and
     * {@code AuthService.changeUserRole} (assignment guard).
     */
    public static final java.util.List<Role> OPERATIONAL = java.util.List.of(
            ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, LINE_MANAGER, EMPLOYEE);
}