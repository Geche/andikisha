package com.andikisha.tenant.domain.repository;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.tenant.domain.model.TenantLicence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantLicenceRepository extends JpaRepository<TenantLicence, UUID> {

    Optional<TenantLicence> findByTenantIdAndStatusIn(String tenantId, List<LicenceStatus> statuses);

    List<TenantLicence> findByTenantIdInAndStatusIn(List<String> tenantIds, List<LicenceStatus> statuses);

    List<TenantLicence> findByStatusIn(List<LicenceStatus> statuses);

    List<TenantLicence> findByStatusAndEndDateBefore(LicenceStatus status, LocalDate date);

    List<TenantLicence> findByStatusAndSuspendedAtBefore(LicenceStatus status, LocalDateTime dateTime);

    List<TenantLicence> findByStatusInAndEndDateBetween(List<LicenceStatus> statuses,
                                                        LocalDate from,
                                                        LocalDate to);

    Optional<TenantLicence> findByLicenceKey(UUID licenceKey);

    /**
     * Aggregate licence counts and MRR per status in a single SQL pass.
     * Returns rows of [LicenceStatus, count (Long), mrrKes (BigDecimal)].
     *
     * MRR formula: MONTHLY -> agreedPriceKes; ANNUAL -> agreedPriceKes / 12.
     */
    @Query("""
            SELECT l.status,
                   COUNT(l),
                   SUM(CASE WHEN l.billingCycle = 'ANNUAL'
                            THEN l.agreedPriceKes / 12
                            ELSE l.agreedPriceKes END)
            FROM TenantLicence l
            GROUP BY l.status
            """)
    List<Object[]> aggregateCountAndMrrByStatus();

    /**
     * Aggregate active seat count, plan-breakdown count, and plan-breakdown MRR
     * in a single SQL pass for the statuses that contribute to seat/revenue metrics.
     * Returns rows of [planId (UUID), count (Long), mrrKes (BigDecimal), totalSeats (Long)].
     */
    @Query("""
            SELECT l.planId,
                   COUNT(l),
                   SUM(CASE WHEN l.billingCycle = 'ANNUAL'
                            THEN l.agreedPriceKes / 12
                            ELSE l.agreedPriceKes END),
                   SUM(l.seatCount)
            FROM TenantLicence l
            WHERE l.status IN :statuses
            GROUP BY l.planId
            """)
    List<Object[]> aggregatePlanBreakdown(@Param("statuses") List<LicenceStatus> statuses);

    /**
     * Count distinct tenants whose licence started on or after {@code from}.
     */
    @Query("SELECT COUNT(DISTINCT l.tenantId) FROM TenantLicence l WHERE l.startDate >= :from")
    long countDistinctTenantsStartedSince(@Param("from") LocalDate from);

    /**
     * Count distinct tenants that churned (CANCELLED or EXPIRED) with updatedAt on or after {@code from}.
     */
    @Query("""
            SELECT COUNT(DISTINCT l.tenantId)
            FROM TenantLicence l
            WHERE l.status IN :statuses
              AND l.updatedAt >= :from
            """)
    long countDistinctChurnedSince(@Param("statuses") List<LicenceStatus> statuses,
                                   @Param("from") LocalDateTime from);

    /**
     * Find GRACE_PERIOD licences where grace_period_entered_at is before the cutoff,
     * eliminating per-licence history queries in the expiry job.
     */
    List<TenantLicence> findByStatusAndGracePeriodEnteredAtBefore(LicenceStatus status,
                                                                   LocalDateTime cutoff);
}
