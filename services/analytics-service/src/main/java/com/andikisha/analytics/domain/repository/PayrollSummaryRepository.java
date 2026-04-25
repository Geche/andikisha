package com.andikisha.analytics.domain.repository;

import com.andikisha.analytics.domain.model.PayrollSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayrollSummaryRepository extends JpaRepository<PayrollSummary, UUID> {

    Optional<PayrollSummary> findByTenantIdAndPeriod(String tenantId, String period);

    List<PayrollSummary> findByTenantIdOrderByPeriodDesc(String tenantId);

    @Query("""
        SELECT ps FROM PayrollSummary ps
        WHERE ps.tenantId = :tenantId
        AND ps.period >= :fromPeriod
        AND ps.period <= :toPeriod
        ORDER BY ps.period ASC
        """)
    List<PayrollSummary> findByTenantIdAndPeriodRange(
            String tenantId, String fromPeriod, String toPeriod);
}