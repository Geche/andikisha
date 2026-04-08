package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByIdAndTenantId(UUID id, String tenantId);

    List<Department> findByTenantIdAndActiveTrue(String tenantId);

    boolean existsByTenantIdAndName(String tenantId, String name);
}