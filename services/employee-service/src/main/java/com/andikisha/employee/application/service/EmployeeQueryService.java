package com.andikisha.employee.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.dto.response.EmployeeSummaryResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.employee.domain.model.EmploymentStatus;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class EmployeeQueryService {

    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;

    public EmployeeQueryService(EmployeeRepository repository, EmployeeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public EmployeeDetailResponse findById(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByIdAndTenantId(id, tenantId)
                .map(mapper::toDetailResponse)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    public Page<EmployeeSummaryResponse> findAll(String departmentId,
                                                 String status,
                                                 String search,
                                                 Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();

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
        return repository.findByTenantIdAndStatus(tenantId, EmploymentStatus.ACTIVE)
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
