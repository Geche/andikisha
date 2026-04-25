package com.andikisha.audit.domain.repository;

import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.audit.domain.model.AuditEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuditEntryRepository extends JpaRepository<AuditEntry, UUID> {

    Page<AuditEntry> findByTenantIdOrderByOccurredAtDesc(
            String tenantId, Pageable pageable);

    Page<AuditEntry> findByTenantIdAndDomainOrderByOccurredAtDesc(
            String tenantId, AuditDomain domain, Pageable pageable);

    Page<AuditEntry> findByTenantIdAndActionOrderByOccurredAtDesc(
            String tenantId, AuditAction action, Pageable pageable);

    Page<AuditEntry> findByTenantIdAndResourceTypeAndResourceIdOrderByOccurredAtDesc(
            String tenantId, String resourceType, String resourceId, Pageable pageable);

    Page<AuditEntry> findByTenantIdAndActorIdOrderByOccurredAtDesc(
            String tenantId, String actorId, Pageable pageable);

    @Query("""
        SELECT a FROM AuditEntry a
        WHERE a.tenantId = :tenantId
        AND a.occurredAt >= :from AND a.occurredAt <= :to
        ORDER BY a.occurredAt DESC
        """)
    Page<AuditEntry> findByTenantIdAndDateRange(
            String tenantId, Instant from, Instant to, Pageable pageable);

    @Query("""
        SELECT a FROM AuditEntry a
        WHERE a.tenantId = :tenantId
        AND a.domain = :domain
        AND a.occurredAt >= :from AND a.occurredAt <= :to
        ORDER BY a.occurredAt DESC
        """)
    List<AuditEntry> findByTenantIdDomainAndDateRange(
            String tenantId, AuditDomain domain, Instant from, Instant to);

    @Query("""
        SELECT a.domain, a.action, COUNT(a)
        FROM AuditEntry a
        WHERE a.tenantId = :tenantId
        AND a.occurredAt >= :from AND a.occurredAt <= :to
        GROUP BY a.domain, a.action
        ORDER BY COUNT(a) DESC
        """)
    List<Object[]> countByDomainAndAction(String tenantId, Instant from, Instant to);

    long countByTenantId(String tenantId);
}