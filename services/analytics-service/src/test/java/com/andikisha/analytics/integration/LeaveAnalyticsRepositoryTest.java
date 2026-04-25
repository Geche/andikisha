package com.andikisha.analytics.integration;

import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.repository.LeaveAnalyticsRepository;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class LeaveAnalyticsRepositoryTest {

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
    LeaveAnalyticsRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private LeaveAnalytics buildLeave(String tenantId, String period, String leaveType) {
        return LeaveAnalytics.create(tenantId, period, leaveType);
    }

    @Test
    void findByTenantIdAndPeriodAndLeaveType_enforcesTenantIsolation() {
        LeaveAnalytics la = repository.save(buildLeave(TENANT_A, "2026-04", "ANNUAL"));
        repository.save(buildLeave(TENANT_B, "2026-04", "ANNUAL"));

        assertThat(repository.findByTenantIdAndPeriodAndLeaveType(TENANT_A, "2026-04", "ANNUAL")).isPresent();
        assertThat(repository.findByTenantIdAndPeriodAndLeaveType(TENANT_A, "2026-04", "ANNUAL").get().getId()).isEqualTo(la.getId());
    }

    @Test
    void findByTenantIdAndPeriodAndLeaveType_differentPeriods() {
        LeaveAnalytics la = repository.save(buildLeave(TENANT_A, "2026-04", "ANNUAL"));
        repository.save(buildLeave(TENANT_A, "2026-05", "ANNUAL"));

        assertThat(repository.findByTenantIdAndPeriodAndLeaveType(TENANT_A, "2026-04", "ANNUAL")).isPresent();
        assertThat(repository.findByTenantIdAndPeriodAndLeaveType(TENANT_A, "2026-04", "ANNUAL").get().getId()).isEqualTo(la.getId());
    }

    @Test
    void findByTenantIdAndPeriodAndLeaveType_differentLeaveTypes() {
        LeaveAnalytics la = repository.save(buildLeave(TENANT_A, "2026-04", "ANNUAL"));
        repository.save(buildLeave(TENANT_A, "2026-04", "SICK"));

        assertThat(repository.findByTenantIdAndPeriodAndLeaveType(TENANT_A, "2026-04", "ANNUAL")).isPresent();
        assertThat(repository.findByTenantIdAndPeriodAndLeaveType(TENANT_A, "2026-04", "ANNUAL").get().getId()).isEqualTo(la.getId());
    }

    @Test
    void findByTenantIdAndPeriodOrderByLeaveTypeAsc_ordersByType() {
        repository.save(buildLeave(TENANT_A, "2026-04", "SICK"));
        repository.save(buildLeave(TENANT_A, "2026-04", "ANNUAL"));
        repository.save(buildLeave(TENANT_A, "2026-04", "MATERNITY"));
        repository.save(buildLeave(TENANT_B, "2026-04", "ANNUAL"));

        List<LeaveAnalytics> result = repository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT_A, "2026-04");

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getLeaveType()).isEqualTo("ANNUAL");
        assertThat(result.get(1).getLeaveType()).isEqualTo("MATERNITY");
        assertThat(result.get(2).getLeaveType()).isEqualTo("SICK");
    }

    @Test
    void findByTenantIdAndPeriodOrderByLeaveTypeAsc_excludesOtherTenants() {
        repository.save(buildLeave(TENANT_A, "2026-04", "ANNUAL"));
        repository.save(buildLeave(TENANT_B, "2026-04", "SICK"));

        List<LeaveAnalytics> result = repository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT_A, "2026-04");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    @Test
    void findByTenantIdAndLeaveTypeOrderByPeriodDesc_ordersByPeriodDesc() {
        repository.save(buildLeave(TENANT_A, "2026-01", "ANNUAL"));
        repository.save(buildLeave(TENANT_A, "2026-03", "ANNUAL"));
        repository.save(buildLeave(TENANT_A, "2026-02", "ANNUAL"));
        repository.save(buildLeave(TENANT_B, "2026-03", "ANNUAL"));

        List<LeaveAnalytics> result = repository.findByTenantIdAndLeaveTypeOrderByPeriodDesc(TENANT_A, "ANNUAL");

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getPeriod()).isEqualTo("2026-03");
        assertThat(result.get(1).getPeriod()).isEqualTo("2026-02");
        assertThat(result.get(2).getPeriod()).isEqualTo("2026-01");
    }

    @Test
    void findByTenantIdAndLeaveTypeOrderByPeriodDesc_excludesOtherTenants() {
        repository.save(buildLeave(TENANT_A, "2026-04", "ANNUAL"));
        repository.save(buildLeave(TENANT_B, "2026-04", "ANNUAL"));

        List<LeaveAnalytics> result = repository.findByTenantIdAndLeaveTypeOrderByPeriodDesc(TENANT_A, "ANNUAL");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTenantId()).isEqualTo(TENANT_A);
    }
}
