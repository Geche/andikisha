package com.andikisha.employee.application.service;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.DepartmentResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.domain.exception.DepartmentNotFoundException;
import com.andikisha.employee.domain.model.Department;
import com.andikisha.employee.domain.model.EmploymentStatus;
import com.andikisha.employee.domain.repository.DepartmentRepository;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper mapper;

    public DepartmentService(DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository,
                             EmployeeMapper mapper) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    public List<DepartmentResponse> findAll() {
        String tenantId = TenantContext.requireTenantId();
        return departmentRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(dept -> {
                    DepartmentResponse base = mapper.toResponse(dept);
                    long count = employeeRepository.countActiveByTenantIdAndDepartmentId(
                            tenantId, dept.getId(), EmploymentStatus.TERMINATED);
                    return new DepartmentResponse(
                            base.id(), base.name(), base.description(),
                            base.parentId(), count, base.active());
                })
                .toList();
    }

    @Transactional
    public DepartmentResponse create(String name, String description, UUID parentId) {
        String tenantId = TenantContext.requireTenantId();

        if (departmentRepository.existsByTenantIdAndName(tenantId, name)) {
            throw new DuplicateResourceException("Department", "name", name);
        }

        Department parent = null;
        if (parentId != null) {
            parent = departmentRepository.findByIdAndTenantId(parentId, tenantId)
                    .orElseThrow(() -> new DepartmentNotFoundException(parentId));
        }

        Department department = Department.create(tenantId, name, description, parent);
        department = departmentRepository.save(department);

        return mapper.toResponse(department);
    }

    @Transactional
    public DepartmentResponse update(UUID id, String name, String description) {
        String tenantId = TenantContext.requireTenantId();
        Department department = departmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new DepartmentNotFoundException(id));
        department.update(name, description);
        department = departmentRepository.save(department);
        return mapper.toResponse(department);
    }
}
