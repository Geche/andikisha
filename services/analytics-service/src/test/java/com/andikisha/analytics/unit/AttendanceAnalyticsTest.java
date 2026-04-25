package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AttendanceAnalyticsTest {

    private static final String TENANT = "tenant-a";
    private static final String PERIOD = "2026-04";

    @Test
    void create_initializesAllFieldsToZero() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);

        assertThat(a.getPeriod()).isEqualTo(PERIOD);
        assertThat(a.getTenantId()).isEqualTo(TENANT);
        assertThat(a.getTotalClockIns()).isZero();
        assertThat(a.getTotalRegularHours()).isEqualTo(BigDecimal.ZERO);
        assertThat(a.getTotalOvertimeHours()).isEqualTo(BigDecimal.ZERO);
        assertThat(a.getAverageHoursPerDay()).isEqualTo(BigDecimal.ZERO);
        assertThat(a.getLateArrivals()).isZero();
        assertThat(a.getAbsentDays()).isZero();
    }

    @Test
    void recordClockIn_incrementsCounter() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);
        a.recordClockIn();
        a.recordClockIn();

        assertThat(a.getTotalClockIns()).isEqualTo(2);
    }

    @Test
    void addHours_accumulatesRegularAndOvertime() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);
        a.recordClockIn();
        a.addHours(new BigDecimal("8.00"), new BigDecimal("2.50"));

        assertThat(a.getTotalRegularHours()).isEqualTo(new BigDecimal("8.00"));
        assertThat(a.getTotalOvertimeHours()).isEqualTo(new BigDecimal("2.50"));
        assertThat(a.getAverageHoursPerDay()).isEqualTo(new BigDecimal("10.50"));
    }

    @Test
    void addHours_withZeroClockIns_doesNotDivideByZero() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);
        a.addHours(new BigDecimal("5.00"), BigDecimal.ZERO);

        assertThat(a.getAverageHoursPerDay()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void addHours_multipleCalls_recalculatesAverage() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);
        a.recordClockIn();
        a.recordClockIn();
        a.addHours(new BigDecimal("8.00"), BigDecimal.ZERO);
        a.addHours(new BigDecimal("7.00"), new BigDecimal("1.00"));

        assertThat(a.getTotalRegularHours()).isEqualTo(new BigDecimal("15.00"));
        assertThat(a.getTotalOvertimeHours()).isEqualTo(new BigDecimal("1.00"));
        assertThat(a.getAverageHoursPerDay()).isEqualTo(new BigDecimal("8.00"));
    }

    @Test
    void incrementAbsent_incrementsCounter() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);
        a.incrementAbsent();

        assertThat(a.getAbsentDays()).isEqualTo(1);
    }

    @Test
    void incrementLateArrivals_incrementsCounter() {
        AttendanceAnalytics a = AttendanceAnalytics.create(TENANT, PERIOD);
        a.incrementLateArrivals();
        a.incrementLateArrivals();

        assertThat(a.getLateArrivals()).isEqualTo(2);
    }
}
