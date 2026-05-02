package com.andikisha.payroll.domain.repository;

import com.andikisha.payroll.domain.model.PayFrequency;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {

    Optional<PayrollRun> findByIdAndTenantId(UUID id, String tenantId);

    Page<PayrollRun> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    boolean existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
            String tenantId, String period, PayFrequency payFrequency, PayrollStatus status);

    @Query("""
        SELECT COUNT(r) > 0 FROM PayrollRun r
        WHERE r.tenantId = :tenantId
        AND r.period = :period
        AND r.payFrequency = :payFrequency
        AND r.status IN :activeStatuses
        """)
    boolean existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
            @Param("tenantId") String tenantId,
            @Param("period") String period,
            @Param("payFrequency") PayFrequency payFrequency,
            @Param("activeStatuses") List<PayrollStatus> activeStatuses);

    boolean existsByTenantIdAndStatusIn(String tenantId, java.util.List<PayrollStatus> statuses);
}