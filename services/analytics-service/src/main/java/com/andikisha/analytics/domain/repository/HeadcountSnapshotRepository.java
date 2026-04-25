package com.andikisha.analytics.domain.repository;

import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HeadcountSnapshotRepository extends JpaRepository<HeadcountSnapshot, UUID> {

    Optional<HeadcountSnapshot> findByTenantIdAndSnapshotDate(
            String tenantId, LocalDate date);

    @Query("""
        SELECT h FROM HeadcountSnapshot h
        WHERE h.tenantId = :tenantId
        AND h.snapshotDate >= :from AND h.snapshotDate <= :to
        ORDER BY h.snapshotDate ASC
        """)
    List<HeadcountSnapshot> findByTenantIdAndDateRange(
            String tenantId, LocalDate from, LocalDate to);

    @Query("""
        SELECT h FROM HeadcountSnapshot h
        WHERE h.tenantId = :tenantId
        ORDER BY h.snapshotDate DESC
        LIMIT 1
        """)
    Optional<HeadcountSnapshot> findLatest(String tenantId);
}