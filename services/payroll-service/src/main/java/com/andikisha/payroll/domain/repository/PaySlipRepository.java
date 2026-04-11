package com.andikisha.payroll.domain.repository;

import com.andikisha.payroll.domain.model.PaySlip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaySlipRepository extends JpaRepository<PaySlip, UUID> {

    Optional<PaySlip> findByIdAndTenantId(UUID id, String tenantId);

    List<PaySlip> findByPayrollRunIdAndTenantId(UUID payrollRunId, String tenantId);

    Page<PaySlip> findByEmployeeIdAndTenantIdOrderByCreatedAtDesc(
            UUID employeeId, String tenantId, Pageable pageable);

    // Spring Data derives the LIMIT 1 from "findFirst" — avoids non-portable JPQL LIMIT clause.
    // Orders by the payroll run's period descending to get the most recent payslip.
    Optional<PaySlip> findFirstByEmployeeIdAndTenantIdOrderByCreatedAtDesc(
            UUID employeeId, String tenantId);
}