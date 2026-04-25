package com.andikisha.audit.unit;

import com.andikisha.audit.application.dto.response.AuditEntryResponse;
import com.andikisha.audit.application.dto.response.AuditSummaryResponse;
import com.andikisha.audit.application.mapper.AuditMapper;
import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.audit.domain.model.AuditEntry;
import com.andikisha.audit.domain.repository.AuditEntryRepository;
import com.andikisha.common.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock private AuditEntryRepository repository;
    @Mock private AuditMapper mapper;

    @InjectMocks private AuditService auditService;

    private static final String TENANT = "tenant-audit-test";
    private final Pageable pageable = PageRequest.of(0, 10);

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── record ──────────────────────────────────────────────────────────────

    @Test
    void record_savesEntryWithCorrectFields() {
        Instant now = Instant.now();

        auditService.record(TENANT, AuditDomain.EMPLOYEE, AuditAction.CREATE,
                "Employee", "emp-123", "actor-1", "Alice",
                "Employee created", "employee.created", "event-1",
                null, now);

        ArgumentCaptor<AuditEntry> captor = ArgumentCaptor.forClass(AuditEntry.class);
        verify(repository).save(captor.capture());

        AuditEntry saved = captor.getValue();
        assertThat(saved.getTenantId()).isEqualTo(TENANT);
        assertThat(saved.getDomain()).isEqualTo(AuditDomain.EMPLOYEE);
        assertThat(saved.getAction()).isEqualTo(AuditAction.CREATE);
        assertThat(saved.getResourceType()).isEqualTo("Employee");
        assertThat(saved.getResourceId()).isEqualTo("emp-123");
        assertThat(saved.getActorId()).isEqualTo("actor-1");
        assertThat(saved.getActorName()).isEqualTo("Alice");
        assertThat(saved.getDescription()).isEqualTo("Employee created");
        assertThat(saved.getEventType()).isEqualTo("employee.created");
        assertThat(saved.getEventId()).isEqualTo("event-1");
        assertThat(saved.getOccurredAt()).isEqualTo(now);
        assertThat(saved.getRecordedAt()).isNotNull();
    }

    // ── listAll ─────────────────────────────────────────────────────────────

    @Test
    void listAll_usesTenantFromContext_andMapsResults() {
        AuditEntry entry = buildEntry(AuditDomain.PAYROLL, AuditAction.APPROVE);
        AuditEntryResponse response = buildResponse(entry);
        Page<AuditEntry> page = new PageImpl<>(List.of(entry));

        when(repository.findByTenantIdOrderByOccurredAtDesc(TENANT, pageable)).thenReturn(page);
        when(mapper.toResponse(entry)).thenReturn(response);

        Page<AuditEntryResponse> result = auditService.listAll(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isSameAs(response);
        verify(repository).findByTenantIdOrderByOccurredAtDesc(TENANT, pageable);
    }

    // ── listByDomain ─────────────────────────────────────────────────────────

    @Test
    void listByDomain_validDomain_filtersCorrectly() {
        AuditEntry entry = buildEntry(AuditDomain.LEAVE, AuditAction.APPROVE);
        AuditEntryResponse response = buildResponse(entry);
        Page<AuditEntry> page = new PageImpl<>(List.of(entry));

        when(repository.findByTenantIdAndDomainOrderByOccurredAtDesc(
                TENANT, AuditDomain.LEAVE, pageable)).thenReturn(page);
        when(mapper.toResponse(entry)).thenReturn(response);

        Page<AuditEntryResponse> result = auditService.listByDomain("leave", pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(repository).findByTenantIdAndDomainOrderByOccurredAtDesc(TENANT, AuditDomain.LEAVE, pageable);
    }

    @Test
    void listByDomain_caseInsensitive_parsesEnum() {
        when(repository.findByTenantIdAndDomainOrderByOccurredAtDesc(
                eq(TENANT), eq(AuditDomain.PAYROLL), any(Pageable.class)))
                .thenReturn(Page.empty());

        auditService.listByDomain("PAYROLL", pageable);
        auditService.listByDomain("payroll", pageable);
        auditService.listByDomain("Payroll", pageable);

        verify(repository, org.mockito.Mockito.times(3))
                .findByTenantIdAndDomainOrderByOccurredAtDesc(TENANT, AuditDomain.PAYROLL, pageable);
    }

    @Test
    void listByDomain_invalidDomain_throwsIllegalArgument() {
        assertThatThrownBy(() -> auditService.listByDomain("INVALID_DOMAIN", pageable))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── listByAction ─────────────────────────────────────────────────────────

    @Test
    void listByAction_validAction_filtersCorrectly() {
        AuditEntry entry = buildEntry(AuditDomain.AUTH, AuditAction.LOGIN);
        AuditEntryResponse response = buildResponse(entry);
        Page<AuditEntry> page = new PageImpl<>(List.of(entry));

        when(repository.findByTenantIdAndActionOrderByOccurredAtDesc(
                TENANT, AuditAction.LOGIN, pageable)).thenReturn(page);
        when(mapper.toResponse(entry)).thenReturn(response);

        Page<AuditEntryResponse> result = auditService.listByAction("login", pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(repository).findByTenantIdAndActionOrderByOccurredAtDesc(TENANT, AuditAction.LOGIN, pageable);
    }

    @Test
    void listByAction_invalidAction_throwsIllegalArgument() {
        assertThatThrownBy(() -> auditService.listByAction("NONEXISTENT", pageable))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── listByResource ────────────────────────────────────────────────────────

    @Test
    void listByResource_passesCorrectParams() {
        when(repository.findByTenantIdAndResourceTypeAndResourceIdOrderByOccurredAtDesc(
                TENANT, "Employee", "emp-42", pageable)).thenReturn(Page.empty());

        auditService.listByResource("Employee", "emp-42", pageable);

        verify(repository).findByTenantIdAndResourceTypeAndResourceIdOrderByOccurredAtDesc(
                TENANT, "Employee", "emp-42", pageable);
    }

    // ── listByActor ───────────────────────────────────────────────────────────

    @Test
    void listByActor_passesCorrectParams() {
        when(repository.findByTenantIdAndActorIdOrderByOccurredAtDesc(
                TENANT, "actor-99", pageable)).thenReturn(Page.empty());

        auditService.listByActor("actor-99", pageable);

        verify(repository).findByTenantIdAndActorIdOrderByOccurredAtDesc(TENANT, "actor-99", pageable);
    }

    // ── listByDateRange ───────────────────────────────────────────────────────

    @Test
    void listByDateRange_convertsLocalDateToInstantCorrectly() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);
        Instant expectedFrom = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant expectedTo = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        when(repository.findByTenantIdAndDateRange(TENANT, expectedFrom, expectedTo, pageable))
                .thenReturn(Page.empty());

        auditService.listByDateRange(from, to, pageable);

        verify(repository).findByTenantIdAndDateRange(TENANT, expectedFrom, expectedTo, pageable);
    }

    @Test
    void listByDateRange_toDateIsExclusive_includesFullDay() {
        LocalDate to = LocalDate.of(2026, 4, 30);
        // to-instant must be start of May 1 (exclusive upper bound for April 30)
        Instant expectedTo = LocalDate.of(2026, 5, 1).atStartOfDay().toInstant(ZoneOffset.UTC);

        when(repository.findByTenantIdAndDateRange(eq(TENANT), any(), eq(expectedTo), eq(pageable)))
                .thenReturn(Page.empty());

        auditService.listByDateRange(LocalDate.of(2026, 4, 1), to, pageable);

        verify(repository).findByTenantIdAndDateRange(eq(TENANT), any(), eq(expectedTo), eq(pageable));
    }

    // ── getSummary ────────────────────────────────────────────────────────────

    @Test
    void getSummary_buildsSummaryWithBreakdown() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);
        Instant fromInst = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInst = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        Object[] row1 = new Object[]{AuditDomain.EMPLOYEE, AuditAction.CREATE, 5L};
        Object[] row2 = new Object[]{AuditDomain.LEAVE, AuditAction.APPROVE, 3L};

        when(repository.countByTenantId(TENANT)).thenReturn(42L);
        when(repository.countByDomainAndAction(TENANT, fromInst, toInst))
                .thenReturn(List.of(row1, row2));

        AuditSummaryResponse result = auditService.getSummary(from, to);

        assertThat(result.totalEntries()).isEqualTo(42L);
        assertThat(result.breakdown()).hasSize(2);
        assertThat(result.breakdown().get(0).domain()).isEqualTo("EMPLOYEE");
        assertThat(result.breakdown().get(0).action()).isEqualTo("CREATE");
        assertThat(result.breakdown().get(0).count()).isEqualTo(5L);
        assertThat(result.breakdown().get(1).domain()).isEqualTo("LEAVE");
        assertThat(result.breakdown().get(1).action()).isEqualTo("APPROVE");
        assertThat(result.breakdown().get(1).count()).isEqualTo(3L);
    }

    @Test
    void getSummary_emptyBreakdown_returnsEmptyList() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        when(repository.countByTenantId(TENANT)).thenReturn(0L);
        when(repository.countByDomainAndAction(eq(TENANT), any(), any()))
                .thenReturn(List.of());

        AuditSummaryResponse result = auditService.getSummary(from, to);

        assertThat(result.totalEntries()).isZero();
        assertThat(result.breakdown()).isEmpty();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AuditEntry buildEntry(AuditDomain domain, AuditAction action) {
        return AuditEntry.record(TENANT, domain, action,
                "Resource", "res-1", "actor-1", "Test Actor",
                "description", "event.type", "event-id",
                null, Instant.now());
    }

    private AuditEntryResponse buildResponse(AuditEntry entry) {
        return new AuditEntryResponse(
                UUID.randomUUID(),
                entry.getDomain().name(),
                entry.getAction().name(),
                entry.getResourceType(),
                entry.getResourceId(),
                entry.getActorId(),
                entry.getActorName(),
                entry.getDescription(),
                entry.getEventType(),
                entry.getOccurredAt(),
                entry.getRecordedAt()
        );
    }
}
