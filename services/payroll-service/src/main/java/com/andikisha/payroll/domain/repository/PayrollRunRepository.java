package com.andikisha.payroll.domain.repository;

import com.andikisha.payroll.domain.model.PayFrequency;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {

    Optional<PayrollRun> findByIdAndTenantId(UUID id, String tenantId);

    Page<PayrollRun> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    boolean existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
            String tenantId, String period, PayFrequency payFrequency, PayrollStatus status);

    boolean existsByTenantIdAndStatusIn(String tenantId, java.util.List<PayrollStatus> statuses);
}