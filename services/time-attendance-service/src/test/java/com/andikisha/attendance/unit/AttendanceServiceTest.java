package com.andikisha.attendance.unit;

import com.andikisha.attendance.application.dto.request.ClockInRequest;
import com.andikisha.attendance.application.dto.request.ClockOutRequest;
import com.andikisha.attendance.application.dto.response.AttendanceResponse;
import com.andikisha.attendance.application.dto.response.MonthlySummaryResponse;
import com.andikisha.attendance.application.mapper.AttendanceMapper;
import com.andikisha.attendance.application.port.AttendanceEventPublisher;
import com.andikisha.attendance.application.service.AttendanceService;
import com.andikisha.attendance.domain.model.AttendanceRecord;
import com.andikisha.attendance.domain.model.AttendanceSource;
import com.andikisha.attendance.domain.model.WorkSchedule;
import com.andikisha.attendance.domain.repository.AttendanceRecordRepository;
import com.andikisha.attendance.domain.repository.WorkScheduleRepository;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;



import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    private static final String TENANT_ID   = "test-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();

    @Mock AttendanceRecordRepository recordRepository;
    @Mock WorkScheduleRepository scheduleRepository;
    @Mock AttendanceMapper mapper;
    @Mock AttendanceEventPublisher eventPublisher;

    private AttendanceService service;

    @BeforeEach
    void setUp() {
        service = new AttendanceService(recordRepository, scheduleRepository, mapper, eventPublisher);
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // clockIn
    // -------------------------------------------------------------------------

    @Test
    void clockIn_happyPath_savesAndPublishesEvent() {
        LocalDateTime now = LocalDateTime.of(2024, 4, 15, 8, 5);
        ClockInRequest request = new ClockInRequest(now, AttendanceSource.WEB, null, null, null);

        when(recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(false);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(Optional.empty());
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.empty());
        when(recordRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        AttendanceResponse expected = stubResponse();
        when(mapper.toResponse(any(AttendanceRecord.class))).thenReturn(expected);

        AttendanceResponse result = service.clockIn(EMPLOYEE_ID, request);

        assertThat(result).isEqualTo(expected);
        verify(recordRepository).save(any(AttendanceRecord.class));
        verify(eventPublisher).publishClockIn(any(AttendanceRecord.class));
    }

    @Test
    void clockIn_whenAlreadyClockedIn_throwsBusinessRuleException() {
        LocalDateTime now = LocalDateTime.of(2024, 4, 15, 8, 5);
        ClockInRequest request = new ClockInRequest(now, AttendanceSource.WEB, null, null, null);
        AttendanceRecord existing = AttendanceRecord.createClockIn(TENANT_ID, EMPLOYEE_ID,
                now.atZone(ZoneId.of("Africa/Nairobi")).toInstant(), AttendanceSource.WEB);

        when(recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(false);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.clockIn(EMPLOYEE_ID, request))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("ALREADY_CLOCKED_IN"));

        verify(recordRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void clockIn_whenEmployeeOnLeave_throwsBusinessRuleException() {
        LocalDateTime now = LocalDateTime.of(2024, 4, 15, 8, 5);
        ClockInRequest request = new ClockInRequest(now, AttendanceSource.MOBILE_GPS, null, null, null);

        when(recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(true);

        assertThatThrownBy(() -> service.clockIn(EMPLOYEE_ID, request))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("EMPLOYEE_ON_LEAVE"));

        verify(recordRepository, never()).save(any());
    }

    @Test
    void clockIn_lateArrival_marksRecordLate() {
        // Schedule starts at 08:00 with 15-minute threshold; employee arrives at 08:20 → late
        LocalDateTime clockInTime = LocalDateTime.of(2024, 4, 15, 8, 20);
        ClockInRequest request = new ClockInRequest(clockInTime, AttendanceSource.WEB, null, null, null);
        WorkSchedule schedule = WorkSchedule.createDefault(TENANT_ID);

        when(recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_ID, EMPLOYEE_ID, clockInTime.toLocalDate())).thenReturn(false);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, clockInTime.toLocalDate())).thenReturn(Optional.empty());
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.of(schedule));
        when(recordRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(AttendanceRecord.class))).thenAnswer(inv -> {
            AttendanceRecord r = inv.getArgument(0);
            assertThat(r.isLate()).isTrue();
            assertThat(r.getLateMinutes()).isEqualTo(20);
            return stubResponse();
        });

        service.clockIn(EMPLOYEE_ID, request);

        verify(mapper).toResponse(any(AttendanceRecord.class));
    }

    @Test
    void clockIn_earlyArrival_isNeverMarkedLate() {
        // Employee arrives 30 minutes BEFORE schedule start → must not be marked late (C1 fix)
        LocalDateTime clockInTime = LocalDateTime.of(2024, 4, 15, 7, 30);
        ClockInRequest request = new ClockInRequest(clockInTime, AttendanceSource.WEB, null, null, null);
        WorkSchedule schedule = WorkSchedule.createDefault(TENANT_ID);

        when(recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_ID, EMPLOYEE_ID, clockInTime.toLocalDate())).thenReturn(false);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, clockInTime.toLocalDate())).thenReturn(Optional.empty());
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.of(schedule));
        when(recordRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(AttendanceRecord.class))).thenAnswer(inv -> {
            AttendanceRecord r = inv.getArgument(0);
            assertThat(r.isLate()).isFalse();
            return stubResponse();
        });

        service.clockIn(EMPLOYEE_ID, request);

        verify(mapper).toResponse(any(AttendanceRecord.class));
    }

    @Test
    void clockIn_nullSource_defaultsToWeb() {
        LocalDateTime now = LocalDateTime.of(2024, 4, 15, 8, 0);
        ClockInRequest request = new ClockInRequest(now, null, null, null, null);

        when(recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(false);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, now.toLocalDate())).thenReturn(Optional.empty());
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.empty());
        when(recordRepository.save(any())).thenAnswer(inv -> {
            AttendanceRecord r = inv.getArgument(0);
            assertThat(r.getClockInSource()).isEqualTo(AttendanceSource.WEB);
            return r;
        });
        when(mapper.toResponse(any())).thenReturn(stubResponse());

        service.clockIn(EMPLOYEE_ID, request);
    }

    // -------------------------------------------------------------------------
    // clockOut
    // -------------------------------------------------------------------------

    @Test
    void clockOut_happyPath_calculatesHoursAndPublishesEvent() {
        LocalDateTime clockIn  = LocalDateTime.of(2024, 4, 15, 8, 0);
        LocalDateTime clockOut = LocalDateTime.of(2024, 4, 15, 17, 0);
        ClockOutRequest request = new ClockOutRequest(clockOut, AttendanceSource.WEB, null, null);
        AttendanceRecord record = AttendanceRecord.createClockIn(TENANT_ID, EMPLOYEE_ID,
                clockIn.atZone(ZoneId.of("Africa/Nairobi")).toInstant(), AttendanceSource.WEB);

        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, clockOut.toLocalDate())).thenReturn(Optional.of(record));
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.empty());
        when(recordRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(AttendanceRecord.class))).thenAnswer(inv -> {
            AttendanceRecord r = inv.getArgument(0);
            assertThat(r.getHoursWorked()).isEqualByComparingTo(new BigDecimal("9.00"));
            assertThat(r.getRegularHours()).isEqualByComparingTo(new BigDecimal("8.00"));
            assertThat(r.getOvertimeHours()).isEqualByComparingTo(new BigDecimal("1.00"));
            return stubResponse();
        });

        service.clockOut(EMPLOYEE_ID, request);

        verify(eventPublisher).publishClockOut(any(AttendanceRecord.class));
    }

    @Test
    void clockOut_whenRecordExistsButHasNoClockIn_throwsBusinessRuleException() {
        // IMP-4: absent/leave records have clockIn=null — service must guard before delegating
        LocalDateTime clockOut = LocalDateTime.of(2024, 4, 15, 17, 0);
        ClockOutRequest request = new ClockOutRequest(clockOut, AttendanceSource.WEB, null, null);
        AttendanceRecord absentRecord = AttendanceRecord.markAbsent(TENANT_ID, EMPLOYEE_ID, clockOut.toLocalDate());

        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, clockOut.toLocalDate())).thenReturn(Optional.of(absentRecord));

        assertThatThrownBy(() -> service.clockOut(EMPLOYEE_ID, request))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("NO_CLOCK_IN"));

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void clockOut_whenNoClockInRecord_throwsBusinessRuleException() {
        LocalDateTime clockOut = LocalDateTime.of(2024, 4, 15, 17, 0);
        ClockOutRequest request = new ClockOutRequest(clockOut, AttendanceSource.WEB, null, null);

        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, clockOut.toLocalDate())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.clockOut(EMPLOYEE_ID, request))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("NO_CLOCK_IN"));

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void clockOut_earlyDeparture_marksRecord() {
        // Schedule ends at 17:00; leave at 16:00 (>15 min early) → earlyDeparture
        LocalDateTime clockIn  = LocalDateTime.of(2024, 4, 15, 8, 0);
        LocalDateTime clockOut = LocalDateTime.of(2024, 4, 15, 16, 0);
        ClockOutRequest request = new ClockOutRequest(clockOut, AttendanceSource.WEB, null, null);
        AttendanceRecord record = AttendanceRecord.createClockIn(TENANT_ID, EMPLOYEE_ID,
                clockIn.atZone(ZoneId.of("Africa/Nairobi")).toInstant(), AttendanceSource.WEB);
        WorkSchedule schedule = WorkSchedule.createDefault(TENANT_ID);

        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                TENANT_ID, EMPLOYEE_ID, clockOut.toLocalDate())).thenReturn(Optional.of(record));
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.of(schedule));
        when(recordRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(AttendanceRecord.class))).thenAnswer(inv -> {
            AttendanceRecord r = inv.getArgument(0);
            assertThat(r.isEarlyDeparture()).isTrue();
            return stubResponse();
        });

        service.clockOut(EMPLOYEE_ID, request);
    }

    // -------------------------------------------------------------------------
    // getMonthlySummary
    // -------------------------------------------------------------------------

    @Test
    void getMonthlySummary_aggregatesAllCountsAndHours() {
        LocalDate start = LocalDate.of(2024, 4, 1);
        LocalDate end   = LocalDate.of(2024, 4, 30);

        when(recordRepository.countPresentDays(TENANT_ID, EMPLOYEE_ID, start, end)).thenReturn(18);
        when(recordRepository.countAbsentDays(TENANT_ID, EMPLOYEE_ID, start, end)).thenReturn(2);
        when(recordRepository.countLeaveDays(TENANT_ID, EMPLOYEE_ID, start, end)).thenReturn(2);
        when(recordRepository.countHolidayDays(TENANT_ID, EMPLOYEE_ID, start, end)).thenReturn(1);
        when(recordRepository.countLateDays(TENANT_ID, EMPLOYEE_ID, start, end)).thenReturn(3);
        when(recordRepository.countEarlyDepartureDays(TENANT_ID, EMPLOYEE_ID, start, end)).thenReturn(1);
        when(recordRepository.sumRegularHours(TENANT_ID, EMPLOYEE_ID, start, end))
                .thenReturn(new BigDecimal("144.00"));
        when(recordRepository.sumWeekdayOvertime(TENANT_ID, EMPLOYEE_ID, start, end))
                .thenReturn(new BigDecimal("4.00"));
        when(recordRepository.sumWeekendOvertime(TENANT_ID, EMPLOYEE_ID, start, end))
                .thenReturn(new BigDecimal("8.00"));
        when(recordRepository.sumHolidayHours(TENANT_ID, EMPLOYEE_ID, start, end))
                .thenReturn(new BigDecimal("8.00"));

        MonthlySummaryResponse result = service.getMonthlySummary(EMPLOYEE_ID, "2024-04");

        assertThat(result.daysPresent()).isEqualTo(18);
        assertThat(result.daysAbsent()).isEqualTo(2);
        assertThat(result.daysOnLeave()).isEqualTo(2);
        assertThat(result.daysHoliday()).isEqualTo(1);
        assertThat(result.lateDays()).isEqualTo(3);
        assertThat(result.earlyDepartureDays()).isEqualTo(1);
        assertThat(result.regularHours()).isEqualByComparingTo(new BigDecimal("144.00"));
        assertThat(result.totalHoursWorked()).isEqualByComparingTo(new BigDecimal("164.00"));
    }

    // -------------------------------------------------------------------------
    // createDefaultSchedule
    // -------------------------------------------------------------------------

    @Test
    void createDefaultSchedule_whenNoneExists_savesSchedule() {
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.empty());

        service.createDefaultSchedule(TENANT_ID);

        verify(scheduleRepository).save(any(WorkSchedule.class));
    }

    @Test
    void createDefaultSchedule_whenAlreadyExists_skips() {
        WorkSchedule existing = WorkSchedule.createDefault(TENANT_ID);
        when(scheduleRepository.findByTenantIdAndDefaultScheduleTrue(TENANT_ID))
                .thenReturn(Optional.of(existing));

        service.createDefaultSchedule(TENANT_ID);

        verify(scheduleRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // markLeaveDay
    // -------------------------------------------------------------------------

    @Test
    void markLeaveDay_whenNoRecordExists_createsLeaveRecord() {
        LocalDate date = LocalDate.of(2024, 4, 10);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(TENANT_ID, EMPLOYEE_ID, date))
                .thenReturn(Optional.empty());

        service.markLeaveDay(TENANT_ID, EMPLOYEE_ID, date);

        verify(recordRepository).save(argThat(r -> r.isOnLeave() && !r.isAbsent()));
    }

    @Test
    void markLeaveDay_whenRecordAlreadyExists_doesNotSave() {
        LocalDate date = LocalDate.of(2024, 4, 10);
        AttendanceRecord existing = AttendanceRecord.markOnLeave(TENANT_ID, EMPLOYEE_ID, date);
        when(recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(TENANT_ID, EMPLOYEE_ID, date))
                .thenReturn(Optional.of(existing));

        service.markLeaveDay(TENANT_ID, EMPLOYEE_ID, date);

        verify(recordRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private AttendanceResponse stubResponse() {
        return new AttendanceResponse(UUID.randomUUID(), EMPLOYEE_ID,
                LocalDate.now(), null, null, "WEB", null,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                false, null, false, false, false, false, null, false);
    }
}
