package com.andikisha.employee.application.service;

import com.andikisha.common.scope.ResolvedScope;
import com.andikisha.common.scope.ScopeType;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.dto.response.EmployeeSummaryResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.employee.domain.model.EmploymentStatus;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class EmployeeQueryService {

    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;
    private final CallerScopeResolver scopeResolver;

    public EmployeeQueryService(EmployeeRepository repository,
                                EmployeeMapper mapper,
                                CallerScopeResolver scopeResolver) {
        this.repository = repository;
        this.mapper = mapper;
        this.scopeResolver = scopeResolver;
    }

    public EmployeeDetailResponse findById(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByIdAndTenantId(id, tenantId)
                .map(mapper::toDetailResponse)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    public EmployeeDetailResponse findByEmail(String email) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByEmailAndTenantId(email, tenantId)
                .map(mapper::toDetailResponse)
                .orElseThrow(() -> new com.andikisha.common.exception.ResourceNotFoundException(
                        "Employee", email));
    }

    public Page<EmployeeSummaryResponse> findAll(String callerRole,
                                                 String callerEmployeeId,
                                                 String departmentId,
                                                 String status,
                                                 String search,
                                                 Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();

        ResolvedScope scope = scopeResolver.resolve(callerRole, tenantId, callerEmployeeId);

        if (scope.type() == ScopeType.OWN) {
            // EMPLOYEE: single-record filtered list
            if (callerEmployeeId == null || callerEmployeeId.isBlank()) {
                return Page.empty(pageable);
            }
            return repository.findByTenantIdAndId(tenantId, UUID.fromString(callerEmployeeId), pageable)
                    .map(mapper::toSummary);
        }

        // For DEPARTMENT scope, force departmentId to be the caller's dept
        // (ignore any client-supplied departmentId query param — scope wins)
        if (scope.type() == ScopeType.DEPARTMENT) {
            return repository.findByTenantIdAndDepartmentId(
                            tenantId, scope.departmentId(), pageable)
                    .map(mapper::toSummary);
        }

        // ALL scope — apply optional client filters normally
        if (search != null && !search.isBlank()) {
            return repository.searchByTenantId(tenantId, search, pageable)
                    .map(mapper::toSummary);
        }
        if (departmentId != null) {
            return repository.findByTenantIdAndDepartmentId(
                            tenantId, UUID.fromString(departmentId), pageable)
                    .map(mapper::toSummary);
        }
        if (status != null) {
            EmploymentStatus empStatus;
            try {
                empStatus = EmploymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
            return repository.findByTenantIdAndStatus(tenantId, empStatus, pageable)
                    .map(mapper::toSummary);
        }
        return repository.findByTenantId(tenantId, pageable).map(mapper::toSummary);
    }

    public List<EmployeeDetailResponse> findAllActive() {
        String tenantId = TenantContext.requireTenantId();
        // ON_LEAVE is payroll-eligible: employees on approved paid leave continue to receive salary
        // (with unpaid-leave deductions applied by the payroll engine if applicable).
        // SUSPENDED and TERMINATED are excluded. CANCELLED is not a valid status.
        return repository.findByTenantIdAndStatusIn(
                        tenantId, List.of(
                                EmploymentStatus.ACTIVE,
                                EmploymentStatus.ON_PROBATION,
                                EmploymentStatus.ON_LEAVE))
                .stream().map(mapper::toDetailResponse).toList();
    }

    public List<EmployeeDetailResponse> findAllByIds(List<UUID> ids) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findAllByTenantIdAndIdIn(tenantId, ids)
                .stream().map(mapper::toDetailResponse).toList();
    }

    public long countActive() {
        String tenantId = TenantContext.requireTenantId();
        return repository.countActiveByTenantId(tenantId, EmploymentStatus.TERMINATED);
    }
}
