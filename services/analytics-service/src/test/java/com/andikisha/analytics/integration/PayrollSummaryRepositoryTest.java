package com.andikisha.analytics.integration;

import com.andikisha.analytics.domain.model.PayrollSummary;
import com.andikisha.analytics.domain.repository.PayrollSummaryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class PayrollSummaryRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_analytics")
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
    PayrollSummaryRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private PayrollSummary buildSummary(String tenantId, String period, int count,
                                         BigDecimal gross, BigDecimal net) {
        return PayrollSummary.create(tenantId, period, count, gross, net,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                "run-1", "admin");
    }

    @Test
    void findByTenantIdAndPeriod_enforcesTenantIsolation() {
        PayrollSummary s1 = repository.save(buildSummary(TENANT_A, "2026-04", 10,
                new BigDecimal("1000000"), new BigDecimal("800000")));
        repository.save(buildSummary(TENANT_B, "2026-04", 5,
                new BigDecimal("500000"), new BigDecimal("400000")));

        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-04")).isPresent();
        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-04").get().getId()).isEqualTo(s1.getId());
        assertThat(repository.findByTenantIdAndPeriod(TENANT_B, "2026-04")).isPresent();
    }

    @Test
    void findByTenantIdAndPeriod_differentPeriods() {
        repository.save(buildSummary(TENANT_A, "2026-04", 10,
                new BigDecimal("1000000"), new BigDecimal("800000")));
        PayrollSummary s2 = repository.save(buildSummary(TENANT_A, "2026-05", 11,
                new BigDecimal("1100000"), new BigDecimal("880000")));

        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-05")).isPresent();
        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-05").get().getId()).isEqualTo(s2.getId());
        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-06")).isEmpty();
    }

    @Test
    void findByTenantIdOrderByPeriodDesc_returnsMostRecentFirst() {
        repository.save(buildSummary(TENANT_A, "2026-01", 10,
                new BigDecimal("1000000"), new BigDecimal("800000")));
        repository.save(buildSummary(TENANT_A, "2026-03", 12,
                new BigDecimal("1200000"), new BigDecimal("960000")));
        repository.save(buildSummary(TENANT_A, "2026-02", 11,
                new BigDecimal("1100000"), new BigDecimal("880000")));

        List<PayrollSummary> result = repository.findByTenantIdOrderByPeriodDesc(TENANT_A);

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getPeriod()).isEqualTo("2026-03");
        assertThat(result.get(1).getPeriod()).isEqualTo("2026-02");
        assertThat(result.get(2).getPeriod()).isEqualTo("2026-01");
    }

    @Test
    void findByTenantIdAndPeriodRange_returnsOrderedResults() {
        repository.save(buildSummary(TENANT_A, "2026-01", 10,
                new BigDecimal("1000000"), new BigDecimal("800000")));
        repository.save(buildSummary(TENANT_A, "2026-02", 11,
                new BigDecimal("1100000"), new BigDecimal("880000")));
        repository.save(buildSummary(TENANT_A, "2026-03", 12,
                new BigDecimal("1200000"), new BigDecimal("960000")));
        repository.save(buildSummary(TENANT_B, "2026-02", 5,
                new BigDecimal("500000"), new BigDecimal("400000")));

        List<PayrollSummary> result = repository.findByTenantIdAndPeriodRange(
                TENANT_A, "2026-01", "2026-02");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPeriod()).isEqualTo("2026-01");
        assertThat(result.get(1).getPeriod()).isEqualTo("2026-02");
    }

    @Test
    void findByTenantIdOrderByPeriodDesc_excludesOtherTenants() {
        repository.save(buildSummary(TENANT_A, "2026-04", 10,
                new BigDecimal("1000000"), new BigDecimal("800000")));
        repository.save(buildSummary(TENANT_B, "2026-04", 5,
                new BigDecimal("500000"), new BigDecimal("400000")));

        List<PayrollSummary> result = repository.findByTenantIdOrderByPeriodDesc(TENANT_A);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTenantId()).isEqualTo(TENANT_A);
    }
}
