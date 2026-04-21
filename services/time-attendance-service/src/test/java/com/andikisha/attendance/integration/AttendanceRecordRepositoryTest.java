package com.andikisha.attendance.integration;

import com.andikisha.attendance.domain.model.AttendanceRecord;
import com.andikisha.attendance.domain.model.AttendanceSource;
import com.andikisha.attendance.domain.repository.AttendanceRecordRepository;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class AttendanceRecordRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_attendance")
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
    AttendanceRecordRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";
    private static final UUID   EMPLOYEE  = UUID.randomUUID();
    private static final LocalDate PERIOD_START = LocalDate.of(2024, 4, 1);
    private static final LocalDate PERIOD_END   = LocalDate.of(2024, 4, 30);

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    // -------------------------------------------------------------------------
    // Tenant isolation
    // -------------------------------------------------------------------------

    @Test
    void findByIdAndTenantId_enforcesTenantIsolation() {
        AttendanceRecord record = repository.save(
                AttendanceRecord.createClockIn(TENANT_A, EMPLOYEE,
                        LocalDate.of(2024, 4, 10).atTime(8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB));

        assertThat(repository.findByIdAndTenantId(record.getId(), TENANT_A)).isPresent();
        assertThat(repository.findByIdAndTenantId(record.getId(), TENANT_B)).isEmpty();
    }

    // -------------------------------------------------------------------------
    // countPresentDays
    // -------------------------------------------------------------------------

    @Test
    void countPresentDays_countsOnlyNonAbsentWithClockIn() {
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10)));
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 11)));
        repository.save(AttendanceRecord.markAbsent(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 12)));
        repository.save(AttendanceRecord.markOnLeave(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 13)));

        int count = repository.countPresentDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);

        assertThat(count).isEqualTo(2);
    }

    @Test
    void countPresentDays_excludesOtherTenants() {
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10)));
        repository.save(clockedIn(TENANT_B, EMPLOYEE, LocalDate.of(2024, 4, 10)));

        assertThat(repository.countPresentDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(1);
        assertThat(repository.countPresentDays(TENANT_B, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(1);
    }

    // -------------------------------------------------------------------------
    // countAbsentDays / countLeaveDays / countHolidayDays
    // -------------------------------------------------------------------------

    @Test
    void countAbsentDays_onlyCountsAbsentRecords() {
        repository.save(AttendanceRecord.markAbsent(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 12)));
        repository.save(AttendanceRecord.markAbsent(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 15)));
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10)));

        assertThat(repository.countAbsentDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(2);
    }

    @Test
    void countLeaveDays_onlyCountsLeaveRecords() {
        repository.save(AttendanceRecord.markOnLeave(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 8)));
        repository.save(AttendanceRecord.markOnLeave(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 9)));
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10)));

        assertThat(repository.countLeaveDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(2);
    }

    @Test
    void countHolidayDays_onlyCountsHolidayRecords() {
        repository.save(AttendanceRecord.markHoliday(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 19), "Good Friday"));
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10)));

        assertThat(repository.countHolidayDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(1);
    }

    // -------------------------------------------------------------------------
    // countLateDays / countEarlyDepartureDays
    // -------------------------------------------------------------------------

    @Test
    void countLateDays_countsRecordsMarkedLate() {
        AttendanceRecord lateRecord = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10));
        lateRecord.markLate(25);
        repository.save(lateRecord);
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 11)));

        assertThat(repository.countLateDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(1);
    }

    @Test
    void countEarlyDepartureDays_countsRecordsMarkedEarlyDeparture() {
        AttendanceRecord earlyRecord = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 10));
        earlyRecord.markEarlyDeparture();
        repository.save(earlyRecord);
        repository.save(clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 11)));

        assertThat(repository.countEarlyDepartureDays(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END)).isEqualTo(1);
    }

    // -------------------------------------------------------------------------
    // sumRegularHours / sumWeekdayOvertime / sumWeekendOvertime / sumHolidayHours
    // -------------------------------------------------------------------------

    @Test
    void sumRegularHours_returnsZeroWhenNoRecords() {
        BigDecimal result = repository.sumRegularHours(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void sumRegularHours_sumsAcrossMultipleDays() {
        // Monday 2024-04-08: 8h regular, 1h overtime (weekday)
        AttendanceRecord monday = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 8));
        monday.clockOut(LocalDateTime.of(2024, 4, 8, 18, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(monday);

        // Tuesday 2024-04-09: 8h regular
        AttendanceRecord tuesday = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 9));
        tuesday.clockOut(LocalDateTime.of(2024, 4, 9, 16, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(tuesday);

        BigDecimal regular = repository.sumRegularHours(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);
        assertThat(regular).isEqualByComparingTo(new BigDecimal("16.00"));
    }

    @Test
    void sumRegularHours_excludesHolidayRecords() {
        // IMP-3 regression: regular hours on holiday days must not be double-counted
        AttendanceRecord holiday = AttendanceRecord.createClockIn(TENANT_A, EMPLOYEE,
                LocalDate.of(2024, 4, 19).atTime(8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB);
        ReflectionTestUtils.setField(holiday, "holiday", true);
        holiday.clockOut(LocalDate.of(2024, 4, 19).atTime(16, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(holiday);

        // Regular weekday
        AttendanceRecord weekday = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 8));
        weekday.clockOut(LocalDate.of(2024, 4, 8).atTime(16, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(weekday);

        BigDecimal regular = repository.sumRegularHours(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);
        // Only the weekday record (8h) — holiday excluded from regular sum
        assertThat(regular).isEqualByComparingTo(new BigDecimal("8.00"));
    }

    @Test
    void sumWeekdayOvertime_countsOnlyWeekdayNonHolidayOvertime() {
        // Monday 2024-04-08: 9h worked → 1h overtime (weekday, non-holiday)
        AttendanceRecord monday = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 8));
        monday.clockOut(LocalDate.of(2024, 4, 8).atTime(17, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(monday);

        // Saturday 2024-04-13: 9h worked → 1h overtime (weekend — must NOT be counted here)
        AttendanceRecord saturday = AttendanceRecord.createClockIn(TENANT_A, EMPLOYEE,
                LocalDateTime.of(2024, 4, 13, 8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB);
        saturday.clockOut(LocalDate.of(2024, 4, 13).atTime(17, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(saturday);

        BigDecimal weekdayOT = repository.sumWeekdayOvertime(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);
        assertThat(weekdayOT).isEqualByComparingTo(new BigDecimal("1.00"));
    }

    @Test
    void sumWeekendOvertime_countsOnlySaturdayAndSunday() {
        // Saturday 2024-04-13: 9h worked → 1h weekend overtime
        AttendanceRecord saturday = AttendanceRecord.createClockIn(TENANT_A, EMPLOYEE,
                LocalDateTime.of(2024, 4, 13, 8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB);
        saturday.clockOut(LocalDate.of(2024, 4, 13).atTime(17, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(saturday);

        // Sunday 2024-04-14: 10h worked → 2h weekend overtime
        AttendanceRecord sunday = AttendanceRecord.createClockIn(TENANT_A, EMPLOYEE,
                LocalDateTime.of(2024, 4, 14, 8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB);
        sunday.clockOut(LocalDate.of(2024, 4, 14).atTime(18, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(sunday);

        // Monday 2024-04-08: 9h worked → 1h weekday overtime (must NOT appear here)
        AttendanceRecord monday = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 8));
        monday.clockOut(LocalDate.of(2024, 4, 8).atTime(17, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(monday);

        BigDecimal weekendOT = repository.sumWeekendOvertime(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);
        assertThat(weekendOT).isEqualByComparingTo(new BigDecimal("3.00"));
    }

    @Test
    void sumHolidayHours_countsOnlyHolidayRecords() {
        // Good Friday 2024-04-19 (holiday): employee worked 8h
        AttendanceRecord goodFriday = AttendanceRecord.createClockIn(TENANT_A, EMPLOYEE,
                LocalDate.of(2024, 4, 19).atTime(8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB);
        ReflectionTestUtils.setField(goodFriday, "holiday", true);
        goodFriday.clockOut(LocalDate.of(2024, 4, 19).atTime(16, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(goodFriday);

        // Regular weekday — must not appear in holiday sum
        AttendanceRecord weekday = clockedIn(TENANT_A, EMPLOYEE, LocalDate.of(2024, 4, 8));
        weekday.clockOut(LocalDate.of(2024, 4, 8).atTime(16, 0).atZone(EAT).toInstant(),
                AttendanceSource.WEB, new BigDecimal("8.0"));
        repository.save(weekday);

        BigDecimal holidayHours = repository.sumHolidayHours(TENANT_A, EMPLOYEE, PERIOD_START, PERIOD_END);
        assertThat(holidayHours).isEqualByComparingTo(new BigDecimal("8.00"));
    }

    @Test
    void existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue_returnsCorrectly() {
        LocalDate date = LocalDate.of(2024, 4, 10);
        repository.save(AttendanceRecord.markOnLeave(TENANT_A, EMPLOYEE, date));

        assertThat(repository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_A, EMPLOYEE, date)).isTrue();
        assertThat(repository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_B, EMPLOYEE, date)).isFalse();
        assertThat(repository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_A, EMPLOYEE, date.plusDays(1))).isFalse();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static final ZoneId EAT = ZoneId.of("Africa/Nairobi");

    private AttendanceRecord clockedIn(String tenantId, UUID employeeId, LocalDate date) {
        return AttendanceRecord.createClockIn(tenantId, employeeId,
                date.atTime(8, 0).atZone(EAT).toInstant(), AttendanceSource.WEB);
    }
}
