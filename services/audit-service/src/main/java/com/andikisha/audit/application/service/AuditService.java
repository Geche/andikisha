package com.andikisha.audit.application.service;

import com.andikisha.audit.application.dto.response.AuditEntryResponse;
import com.andikisha.audit.application.dto.response.AuditSummaryResponse;
import com.andikisha.audit.application.mapper.AuditMapper;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.audit.domain.model.AuditEntry;
import com.andikisha.audit.domain.repository.AuditEntryRepository;
import com.andikisha.common.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AuditService {

    private final AuditEntryRepository repository;
    private final AuditMapper mapper;

    public AuditService(AuditEntryRepository repository, AuditMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public void record(String tenantId, AuditDomain domain, AuditAction action,
                       String resourceType, String resourceId,
                       String actorId, String actorName,
                       String description, String eventType, String eventId,
                       String eventData, Instant occurredAt) {
        AuditEntry entry = AuditEntry.record(
                tenantId, domain, action, resourceType, resourceId,
                actorId, actorName, description, eventType, eventId,
                eventData, occurredAt);
        repository.save(entry);
    }

    public Page<AuditEntryResponse> listAll(Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdOrderByOccurredAtDesc(tenantId, pageable)
                .map(mapper::toResponse);
    }

    public Page<AuditEntryResponse> listByDomain(String domain, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        AuditDomain auditDomain = AuditDomain.valueOf(domain.toUpperCase());
        return repository.findByTenantIdAndDomainOrderByOccurredAtDesc(
                        tenantId, auditDomain, pageable)
                .map(mapper::toResponse);
    }

    public Page<AuditEntryResponse> listByAction(String action, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        AuditAction auditAction = AuditAction.valueOf(action.toUpperCase());
        return repository.findByTenantIdAndActionOrderByOccurredAtDesc(
                        tenantId, auditAction, pageable)
                .map(mapper::toResponse);
    }

    public Page<AuditEntryResponse> listByResource(String resourceType,
                                                   String resourceId,
                                                   Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndResourceTypeAndResourceIdOrderByOccurredAtDesc(
                        tenantId, resourceType, resourceId, pageable)
                .map(mapper::toResponse);
    }

    public Page<AuditEntryResponse> listByActor(String actorId, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndActorIdOrderByOccurredAtDesc(
                        tenantId, actorId, pageable)
                .map(mapper::toResponse);
    }

    public Page<AuditEntryResponse> listByDateRange(LocalDate from, LocalDate to,
                                                    Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        return repository.findByTenantIdAndDateRange(
                        tenantId, fromInstant, toInstant, pageable)
                .map(mapper::toResponse);
    }

    public AuditSummaryResponse getSummary(LocalDate from, LocalDate to) {
        String tenantId = TenantContext.requireTenantId();
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        long totalEntries = repository.countByTenantId(tenantId);
        List<Object[]> breakdown = repository.countByDomainAndAction(
                tenantId, fromInstant, toInstant);

        List<AuditSummaryResponse.DomainActionCount> counts = breakdown.stream()
                .map(row -> new AuditSummaryResponse.DomainActionCount(
                        row[0].toString(), row[1].toString(), (Long) row[2]))
                .toList();

        return new AuditSummaryResponse(totalEntries, counts);
    }
}