package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.EmployeeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, UUID> {

    // Uses 'createdAt' (the BaseEntity JPA attribute mapped to changed_at column via @AttributeOverride)
    Page<EmployeeHistory> findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
            String tenantId, UUID employeeId, Pageable pageable);
}