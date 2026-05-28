package com.andikisha.analytics.integration;

import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import com.andikisha.analytics.domain.repository.AttendanceAnalyticsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class AttendanceAnalyticsRepositoryTest {

    @Autowired
    AttendanceAnalyticsRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private AttendanceAnalytics buildAttendance(String tenantId, String period) {
        return AttendanceAnalytics.create(tenantId, period);
    }

    @Test
    void findByTenantIdAndPeriod_enforcesTenantIsolation() {
        AttendanceAnalytics a1 = repository.save(buildAttendance(TENANT_A, "2026-04"));
        repository.save(buildAttendance(TENANT_B, "2026-04"));

        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-04")).isPresent();
        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-04").get().getId()).isEqualTo(a1.getId());
    }

    @Test
    void findByTenantIdAndPeriod_differentPeriods() {
        AttendanceAnalytics a1 = repository.save(buildAttendance(TENANT_A, "2026-04"));
        repository.save(buildAttendance(TENANT_A, "2026-05"));

        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-04")).isPresent();
        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-04").get().getId()).isEqualTo(a1.getId());
        assertThat(repository.findByTenantIdAndPeriod(TENANT_A, "2026-06")).isEmpty();
    }

    @Test
    void findByTenantIdOrderByPeriodDesc_returnsMostRecentFirst() {
        repository.save(buildAttendance(TENANT_A, "2026-01"));
        repository.save(buildAttendance(TENANT_A, "2026-03"));
        repository.save(buildAttendance(TENANT_A, "2026-02"));
        repository.save(buildAttendance(TENANT_B, "2026-03"));

        List<AttendanceAnalytics> result = repository.findByTenantIdOrderByPeriodDesc(TENANT_A);

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getPeriod()).isEqualTo("2026-03");
        assertThat(result.get(1).getPeriod()).isEqualTo("2026-02");
        assertThat(result.get(2).getPeriod()).isEqualTo("2026-01");
    }

    @Test
    void findByTenantIdOrderByPeriodDesc_excludesOtherTenants() {
        repository.save(buildAttendance(TENANT_A, "2026-04"));
        repository.save(buildAttendance(TENANT_B, "2026-04"));

        List<AttendanceAnalytics> result = repository.findByTenantIdOrderByPeriodDesc(TENANT_A);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTenantId()).isEqualTo(TENANT_A);
    }
}
