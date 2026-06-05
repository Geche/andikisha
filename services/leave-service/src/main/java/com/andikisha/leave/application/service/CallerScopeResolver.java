package com.andikisha.leave.application.service;

import com.andikisha.common.scope.DepartmentScopeException;
import com.andikisha.common.scope.ResolvedScope;
import com.andikisha.common.scope.ScopeType;
import com.andikisha.leave.infrastructure.grpc.EmployeeGrpcClient;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Resolves the effective read scope for the authenticated caller on the "leave" resource.
 *
 * Step ordering (must match the pattern confirmed in Step 1):
 *   1. SUPER_ADMIN / ADMIN → ALL (skip everything; these roles bypass permission checks)
 *   2. Derive scope from role (hardcoded to match SYSTEM seed data in role_permissions)
 *   3. DEPARTMENT scope → gRPC lookup to employee-service for caller's departmentId
 *      If employeeId is blank or employee has no department → DepartmentScopeException (Option C)
 *
 * Scope mapping (leave resource, matches V15 seed):
 *   HR_MANAGER, HR_OFFICER → ALL
 *   LINE_MANAGER           → DEPARTMENT
 *   EMPLOYEE, other        → OWN
 *
 * Note: the legacy 'HR' role was deprecated in V15 and replaced by HR_OFFICER.
 * The 'HR' case has been removed from this mapping; no users should hold HR role.
 * HR_OFFICER has leave:read:all but NOT leave:approve — approval stays with
 * HR_MANAGER, ADMIN, and LINE_MANAGER (for their department).
 */
@Component
public class CallerScopeResolver {

    private final EmployeeGrpcClient employeeGrpcClient;

    public CallerScopeResolver(EmployeeGrpcClient employeeGrpcClient) {
        this.employeeGrpcClient = employeeGrpcClient;
    }

    public ResolvedScope resolve(String role, String tenantId, String employeeId) {
        // Step 1 — ADMIN and SUPER_ADMIN bypass all scope logic
        if ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role)) {
            return ResolvedScope.all();
        }

        // Step 2 — derive scope from role for the leave resource
        ScopeType scopeType = switch (role == null ? "" : role) {
            case "HR_MANAGER", "HR_OFFICER" -> ScopeType.ALL;
            case "LINE_MANAGER" -> ScopeType.DEPARTMENT;
            default -> {
                org.slf4j.LoggerFactory.getLogger(CallerScopeResolver.class)
                    .warn("Unknown role '{}' defaulting to OWN scope on leave resource", role);
                yield ScopeType.OWN;
            }
        };

        if (scopeType == ScopeType.ALL) {
            return ResolvedScope.all();
        }

        if (scopeType == ScopeType.OWN) {
            return ResolvedScope.own();
        }

        // Step 3 — DEPARTMENT scope: fetch caller's department via gRPC
        if (employeeId == null || employeeId.isBlank()) {
            throw new DepartmentScopeException();
        }

        String departmentId = employeeGrpcClient.getEmployee(tenantId, employeeId)
                .filter(e -> !e.getDepartmentId().isBlank())
                .map(com.andikisha.proto.employee.EmployeeResponse::getDepartmentId)
                .orElseThrow(DepartmentScopeException::new);

        return ResolvedScope.department(UUID.fromString(departmentId));
    }
}
