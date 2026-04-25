package com.andikisha.audit.integration;

import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.audit.domain.model.AuditEntry;
import com.andikisha.audit.domain.repository.AuditEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class AuditEntryRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_audit")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    AuditEntryRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";
    private final Pageable pageable = PageRequest.of(0, 20);

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    // ── findByTenantIdOrderByOccurredAtDesc ───────────────────────────────────

    @Test
    void listAll_enforcesTenantIsolation() {
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "e1", Instant.now());
        save(TENANT_B, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "e2", Instant.now());

        Page<AuditEntry> result = repository.findByTenantIdOrderByOccurredAtDesc(TENANT_A, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    @Test
    void listAll_ordersNewestFirst() {
        Instant earlier = Instant.now().minus(10, ChronoUnit.MINUTES);
        Instant later   = Instant.now();

        save(TENANT_A, AuditDomain.LEAVE, AuditAction.SUBMIT,  "LeaveRequest", "lr-1", earlier);
        save(TENANT_A, AuditDomain.LEAVE, AuditAction.APPROVE, "LeaveRequest", "lr-2", later);

        Page<AuditEntry> result = repository.findByTenantIdOrderByOccurredAtDesc(TENANT_A, pageable);

        assertThat(result.getContent().get(0).getResourceId()).isEqualTo("lr-2");
        assertThat(result.getContent().get(1).getResourceId()).isEqualTo("lr-1");
    }

    // ── findByTenantIdAndDomainOrderByOccurredAtDesc ─────────────────────────

    @Test
    void listByDomain_filtersToRequestedDomain() {
        save(TENANT_A, AuditDomain.PAYROLL, AuditAction.APPROVE, "PayrollRun", "pr-1", Instant.now());
        save(TENANT_A, AuditDomain.LEAVE,   AuditAction.APPROVE, "LeaveRequest", "lr-1", Instant.now());
        save(TENANT_B, AuditDomain.PAYROLL, AuditAction.APPROVE, "PayrollRun", "pr-2", Instant.now());

        Page<AuditEntry> result = repository.findByTenantIdAndDomainOrderByOccurredAtDesc(
                TENANT_A, AuditDomain.PAYROLL, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDomain()).isEqualTo(AuditDomain.PAYROLL);
        assertThat(result.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    // ── findByTenantIdAndActionOrderByOccurredAtDesc ─────────────────────────

    @Test
    void listByAction_filtersToRequestedAction() {
        save(TENANT_A, AuditDomain.LEAVE, AuditAction.APPROVE, "LeaveRequest", "lr-1", Instant.now());
        save(TENANT_A, AuditDomain.LEAVE, AuditAction.REJECT,  "LeaveRequest", "lr-2", Instant.now());
        save(TENANT_B, AuditDomain.LEAVE, AuditAction.APPROVE, "LeaveRequest", "lr-3", Instant.now());

        Page<AuditEntry> result = repository.findByTenantIdAndActionOrderByOccurredAtDesc(
                TENANT_A, AuditAction.APPROVE, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAction()).isEqualTo(AuditAction.APPROVE);
        assertThat(result.getContent().get(0).getResourceId()).isEqualTo("lr-1");
    }

    // ── findByTenantIdAndResourceTypeAndResourceIdOrderByOccurredAtDesc ───────

    @Test
    void listByResource_filtersToResourceTypeAndId() {
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "emp-1", Instant.now());
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.UPDATE, "Employee", "emp-1", Instant.now());
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.UPDATE, "Employee", "emp-2", Instant.now());
        save(TENANT_B, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "emp-1", Instant.now());

        Page<AuditEntry> result = repository
                .findByTenantIdAndResourceTypeAndResourceIdOrderByOccurredAtDesc(
                        TENANT_A, "Employee", "emp-1", pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(e -> e.getResourceId().equals("emp-1"));
        assertThat(result.getContent()).allMatch(e -> e.getTenantId().equals(TENANT_A));
    }

    // ── findByTenantIdAndActorIdOrderByOccurredAtDesc ─────────────────────────

    @Test
    void listByActor_filtersToActorId() {
        saveWithActor(TENANT_A, "actor-1", Instant.now());
        saveWithActor(TENANT_A, "actor-2", Instant.now());
        saveWithActor(TENANT_B, "actor-1", Instant.now());

        Page<AuditEntry> result = repository.findByTenantIdAndActorIdOrderByOccurredAtDesc(
                TENANT_A, "actor-1", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getActorId()).isEqualTo("actor-1");
        assertThat(result.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    // ── findByTenantIdAndDateRange ─────────────────────────────────────────────

    @Test
    void listByDateRange_returnsEntriesWithinRange() {
        Instant base = Instant.parse("2026-04-01T00:00:00Z");
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-1", base);
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-2", base.plus(1, ChronoUnit.DAYS));
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-3", base.plus(30, ChronoUnit.DAYS));

        Instant from = base;
        Instant to   = base.plus(2, ChronoUnit.DAYS);

        Page<AuditEntry> result = repository.findByTenantIdAndDateRange(TENANT_A, from, to, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(AuditEntry::getResourceId)
                .containsExactlyInAnyOrder("u-1", "u-2");
    }

    @Test
    void listByDateRange_enforcesTenantIsolation() {
        Instant now = Instant.now();
        Instant past = now.minus(1, ChronoUnit.HOURS);
        Instant future = now.plus(1, ChronoUnit.HOURS);

        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-a", now);
        save(TENANT_B, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-b", now);

        Page<AuditEntry> result = repository.findByTenantIdAndDateRange(TENANT_A, past, future, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    // ── countByDomainAndAction ─────────────────────────────────────────────────

    @Test
    void countByDomainAndAction_aggregatesCorrectly() {
        Instant base = Instant.now();
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "e1", base);
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "e2", base);
        save(TENANT_A, AuditDomain.EMPLOYEE, AuditAction.UPDATE, "Employee", "e3", base);
        save(TENANT_A, AuditDomain.LEAVE,    AuditAction.APPROVE, "LeaveRequest", "l1", base);
        save(TENANT_B, AuditDomain.EMPLOYEE, AuditAction.CREATE, "Employee", "e4", base);

        Instant from = base.minus(1, ChronoUnit.MINUTES);
        Instant to   = base.plus(1, ChronoUnit.MINUTES);

        List<Object[]> rows = repository.countByDomainAndAction(TENANT_A, from, to);

        assertThat(rows).hasSize(3);
        // highest count first
        Object[] first = rows.get(0);
        assertThat(first[0].toString()).isEqualTo("EMPLOYEE");
        assertThat(first[1].toString()).isEqualTo("CREATE");
        assertThat((Long) first[2]).isEqualTo(2L);
    }

    @Test
    void countByDomainAndAction_excludesOutOfRangeEntries() {
        Instant base = Instant.now();
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-1", base.minus(1, ChronoUnit.HOURS));
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-2", base);

        Instant from = base.minus(1, ChronoUnit.MINUTES);
        Instant to   = base.plus(1, ChronoUnit.MINUTES);

        List<Object[]> rows = repository.countByDomainAndAction(TENANT_A, from, to);

        assertThat(rows).hasSize(1);
        assertThat((Long) rows.get(0)[2]).isEqualTo(1L);
    }

    // ── countByTenantId ────────────────────────────────────────────────────────

    @Test
    void countByTenantId_returnsOnlyTenantCount() {
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-1", Instant.now());
        save(TENANT_A, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-2", Instant.now());
        save(TENANT_B, AuditDomain.AUTH, AuditAction.LOGIN, "User", "u-3", Instant.now());

        assertThat(repository.countByTenantId(TENANT_A)).isEqualTo(2L);
        assertThat(repository.countByTenantId(TENANT_B)).isEqualTo(1L);
    }

    @Test
    void countByTenantId_returnsZeroForUnknownTenant() {
        assertThat(repository.countByTenantId("nonexistent-tenant")).isZero();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private AuditEntry save(String tenantId, AuditDomain domain, AuditAction action,
                            String resourceType, String resourceId, Instant occurredAt) {
        return repository.save(AuditEntry.record(
                tenantId, domain, action, resourceType, resourceId,
                "actor-1", "Test Actor", "test description",
                "test.event", "evt-" + resourceId, null, occurredAt));
    }

    private void saveWithActor(String tenantId, String actorId, Instant occurredAt) {
        AuditEntry entry = AuditEntry.record(tenantId, AuditDomain.AUTH, AuditAction.LOGIN,
                "User", "user-1", actorId, "Actor Name",
                "login", "auth.login", "evt-1", null, occurredAt);
        repository.save(entry);
    }
}
