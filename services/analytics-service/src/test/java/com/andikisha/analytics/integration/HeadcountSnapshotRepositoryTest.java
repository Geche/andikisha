package com.andikisha.analytics.integration;

import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.repository.HeadcountSnapshotRepository;
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

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class HeadcountSnapshotRepositoryTest {

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
    HeadcountSnapshotRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private HeadcountSnapshot buildSnapshot(String tenantId, LocalDate date) {
        HeadcountSnapshot s = HeadcountSnapshot.create(tenantId, date);
        s.setTotalActive(10);
        return s;
    }

    @Test
    void findByTenantIdAndSnapshotDate_enforcesTenantIsolation() {
        LocalDate date = LocalDate.of(2026, 4, 15);
        HeadcountSnapshot s1 = repository.save(buildSnapshot(TENANT_A, date));
        repository.save(buildSnapshot(TENANT_B, date));

        assertThat(repository.findByTenantIdAndSnapshotDate(TENANT_A, date)).isPresent();
        assertThat(repository.findByTenantIdAndSnapshotDate(TENANT_A, date).get().getId()).isEqualTo(s1.getId());
    }

    @Test
    void findByTenantIdAndSnapshotDate_differentDates() {
        HeadcountSnapshot s1 = repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 15)));
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 16)));

        assertThat(repository.findByTenantIdAndSnapshotDate(TENANT_A, LocalDate.of(2026, 4, 15))).isPresent();
        assertThat(repository.findByTenantIdAndSnapshotDate(TENANT_A, LocalDate.of(2026, 4, 15)).get().getId()).isEqualTo(s1.getId());
    }

    @Test
    void findByTenantIdAndDateRange_returnsOrderedResults() {
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 10)));
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 15)));
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 20)));
        repository.save(buildSnapshot(TENANT_B, LocalDate.of(2026, 4, 15)));

        List<HeadcountSnapshot> result = repository.findByTenantIdAndDateRange(
                TENANT_A, LocalDate.of(2026, 4, 12), LocalDate.of(2026, 4, 18));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSnapshotDate()).isEqualTo(LocalDate.of(2026, 4, 15));
    }

    @Test
    void findLatest_returnsMostRecentSnapshot() {
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 10)));
        HeadcountSnapshot s2 = repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 20)));
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 15)));

        assertThat(repository.findLatest(TENANT_A)).isPresent();
        assertThat(repository.findLatest(TENANT_A).get().getId()).isEqualTo(s2.getId());
    }

    @Test
    void findLatest_excludesOtherTenants() {
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 15)));
        repository.save(buildSnapshot(TENANT_B, LocalDate.of(2026, 4, 20)));

        assertThat(repository.findLatest(TENANT_A)).isPresent();
        assertThat(repository.findLatest(TENANT_A).get().getSnapshotDate()).isEqualTo(LocalDate.of(2026, 4, 15));
    }

    @Test
    void findLatest_whenNoSnapshots_returnsEmpty() {
        assertThat(repository.findLatest(TENANT_A)).isEmpty();
    }

    @Test
    void findByTenantIdAndDateRange_excludesOtherTenants() {
        repository.save(buildSnapshot(TENANT_A, LocalDate.of(2026, 4, 15)));
        repository.save(buildSnapshot(TENANT_B, LocalDate.of(2026, 4, 15)));

        List<HeadcountSnapshot> result = repository.findByTenantIdAndDateRange(
                TENANT_A, LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 30));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTenantId()).isEqualTo(TENANT_A);
    }
}
