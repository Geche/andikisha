package com.andikisha.payroll.integration;

import com.andikisha.payroll.domain.model.PayFrequency;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class PayrollRunRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_payroll")
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
    PayrollRunRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void findByIdAndTenantId_enforcesTenantIsolation() {
        PayrollRun runA = repository.save(buildRun(TENANT_A, "2024-01"));

        assertThat(repository.findByIdAndTenantId(runA.getId(), TENANT_A)).isPresent();
        assertThat(repository.findByIdAndTenantId(runA.getId(), TENANT_B)).isEmpty();
    }

    @Test
    void existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot_returnsFalseWhenOnlyCancelledExists() {
        PayrollRun run = buildRun(TENANT_A, "2024-01");
        run.cancel("Cancelled for test");
        repository.save(run);

        // A CANCELLED run should not block a new run for the same period
        boolean exists = repository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_A, "2024-01", PayFrequency.MONTHLY, PayrollStatus.CANCELLED);

        assertThat(exists).isFalse();
    }

    @Test
    void existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot_returnsTrueForDraftRun() {
        repository.save(buildRun(TENANT_A, "2024-02"));

        boolean exists = repository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_A, "2024-02", PayFrequency.MONTHLY, PayrollStatus.CANCELLED);

        assertThat(exists).isTrue();
    }

    @Test
    void existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot_isolatesByTenant() {
        repository.save(buildRun(TENANT_A, "2024-03"));

        // TENANT_B has no run for 2024-03
        boolean existsForB = repository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_B, "2024-03", PayFrequency.MONTHLY, PayrollStatus.CANCELLED);

        assertThat(existsForB).isFalse();
    }

    @Test
    void findByTenantIdOrderByCreatedAtDesc_returnsMostRecentFirst() throws InterruptedException {
        PayrollRun first = repository.save(buildRun(TENANT_A, "2024-04"));
        // Small sleep to ensure distinct createdAt timestamps (DB resolution may vary)
        Thread.sleep(10);
        PayrollRun second = repository.save(buildRun(TENANT_A, "2024-05"));

        Page<PayrollRun> page = repository.findByTenantIdOrderByCreatedAtDesc(
                TENANT_A, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getContent().get(0).getPeriod()).isEqualTo(second.getPeriod());
        assertThat(page.getContent().get(1).getPeriod()).isEqualTo(first.getPeriod());
    }

    @Test
    void findByTenantIdOrderByCreatedAtDesc_excludesOtherTenants() {
        repository.save(buildRun(TENANT_A, "2024-06"));
        repository.save(buildRun(TENANT_B, "2024-06"));

        Page<PayrollRun> page = repository.findByTenantIdOrderByCreatedAtDesc(
                TENANT_A, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private PayrollRun buildRun(String tenantId, String period) {
        return PayrollRun.create(tenantId, period, PayFrequency.MONTHLY, "hr-admin");
    }
}
