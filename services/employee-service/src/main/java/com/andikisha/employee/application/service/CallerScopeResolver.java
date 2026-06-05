package com.andikisha.employee.application.service;

import com.andikisha.common.scope.DepartmentScopeException;
import com.andikisha.common.scope.ResolvedScope;
import com.andikisha.common.scope.ScopeType;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Resolves the effective read scope for the authenticated caller on the "employee" resource.
 *
 * Step ordering (confirmed in Step 1 pre-implementation check):
 *   1. SUPER_ADMIN / ADMIN → ALL (bypass; no employee or dept lookup)
 *   2. Derive scope from role (hardcoded to match SYSTEM seed data in role_permissions)
 *   3. DEPARTMENT scope → look up caller's own employee record from THIS service's DB
 *      (no gRPC needed — employee-service is the source of truth)
 *      If employeeId blank or employee has no department → DepartmentScopeException (Option C)
 *
 * Scope mapping (employee resource, matches V15 seed):
 *   HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER → ALL
 *   LINE_MANAGER                            → DEPARTMENT
 *   EMPLOYEE, other                         → OWN
 *
 * Note: the legacy 'HR' role was deprecated in V15 and replaced by HR_OFFICER.
 * The 'HR' case has been removed from this mapping; no users should hold HR role.
 */
@Component
public class CallerScopeResolver {

    private final EmployeeRepository employeeRepository;

    public CallerScopeResolver(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public ResolvedScope resolve(String role, String tenantId, String employeeId) {
        // Step 1 — ADMIN and SUPER_ADMIN bypass all scope logic
        if ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role)) {
            return ResolvedScope.all();
        }

        // Step 2 — derive scope for the employee resource
        ScopeType scopeType = switch (role == null ? "" : role) {
            case "HR_MANAGER", "HR_OFFICER", "PAYROLL_OFFICER" -> ScopeType.ALL;
            case "LINE_MANAGER" -> ScopeType.DEPARTMENT;
            default -> {
                org.slf4j.LoggerFactory.getLogger(CallerScopeResolver.class)
                    .warn("Unknown role '{}' defaulting to OWN scope on employee resource", role);
                yield ScopeType.OWN;
            }
        };

        if (scopeType == ScopeType.ALL) {
            return ResolvedScope.all();
        }
        if (scopeType == ScopeType.OWN) {
            return ResolvedScope.own();
        }

        // Step 3 — DEPARTMENT scope: look up caller's department from our own DB
        if (employeeId == null || employeeId.isBlank()) {
            throw new DepartmentScopeException();
        }

        UUID callerEmpId = UUID.fromString(employeeId);
        UUID departmentId = employeeRepository.findByIdAndTenantId(callerEmpId, tenantId)
                .filter(e -> e.getDepartment() != null)
                .map(e -> e.getDepartment().getId())
                .orElseThrow(DepartmentScopeException::new);

        return ResolvedScope.department(departmentId);
    }
}
