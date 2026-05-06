package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findByIdAndTenantId(UUID id, String tenantId);

    Optional<Tenant> findByAdminEmail(String adminEmail);

    boolean existsByAdminEmail(String adminEmail);

    boolean existsByCompanyNameAndCountry(String companyName, String country);

    Page<Tenant> findByStatus(TenantStatus status, Pageable pageable);

    Page<Tenant> findByStatusIn(List<TenantStatus> statuses, Pageable pageable);

    List<Tenant> findByStatusAndTrialEndsAtBefore(TenantStatus status, LocalDate date);

    long countByStatus(TenantStatus status);

    long countByStatusAndTrialEndsAtBetween(TenantStatus status, LocalDate from, LocalDate to);

    long countByCreatedAtAfter(LocalDateTime after);

    long countByStatusAndCreatedAtAfter(TenantStatus status, LocalDateTime after);

    /**
     * Monthly tenant signup + active counts since {@code start}.
     * <p>
     * The {@code month} column is formatted as {@code "Mon YYYY"} (e.g. "May 2025")
     * so that two months sharing a calendar name across different years are
     * distinguishable in a 12-month rolling window.
     */
    @Query(value = """
            SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                   COUNT(*) AS new_signups,
                   SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_tenants
            FROM tenants
            WHERE created_at >= :start
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
            """, nativeQuery = true)
    List<Object[]> findMonthlyGrowth(@Param("start") LocalDateTime start);
}