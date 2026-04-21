package com.andikisha.attendance.application.service;

import com.andikisha.attendance.application.dto.request.ClockInRequest;
import com.andikisha.attendance.application.dto.request.ClockOutRequest;
import com.andikisha.attendance.application.dto.response.AttendanceResponse;
import com.andikisha.attendance.application.dto.response.MonthlySummaryResponse;
import com.andikisha.attendance.application.mapper.AttendanceMapper;
import com.andikisha.attendance.application.port.AttendanceEventPublisher;
import com.andikisha.attendance.domain.model.AttendanceRecord;
import com.andikisha.attendance.domain.model.AttendanceSource;
import com.andikisha.attendance.domain.model.ClockType;
import com.andikisha.attendance.domain.model.WorkSchedule;
import com.andikisha.attendance.domain.repository.AttendanceRecordRepository;
import com.andikisha.attendance.domain.repository.WorkScheduleRepository;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);
    private static final ZoneId EAT = ZoneId.of("Africa/Nairobi");

    private final AttendanceRecordRepository recordRepository;
    private final WorkScheduleRepository scheduleRepository;
    private final AttendanceMapper mapper;
    private final AttendanceEventPublisher eventPublisher;

    public AttendanceService(AttendanceRecordRepository recordRepository,
                             WorkScheduleRepository scheduleRepository,
                             AttendanceMapper mapper,
                             AttendanceEventPublisher eventPublisher) {
        this.recordRepository = recordRepository;
        this.scheduleRepository = scheduleRepository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public AttendanceResponse clockIn(UUID employeeId, ClockInRequest request) {
        String tenantId = TenantContext.requireTenantId();
        LocalDate date = request.clockInTime().toLocalDate();

        // Check if on approved leave
        if (recordRepository.existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
                tenantId, employeeId, date)) {
            throw new BusinessRuleException("EMPLOYEE_ON_LEAVE",
                    "Cannot clock in while on approved leave");
        }

        // Check for existing record
        var existing = recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                tenantId, employeeId, date);
        if (existing.isPresent() && existing.get().getClockIn() != null) {
            throw new BusinessRuleException("ALREADY_CLOCKED_IN",
                    "Already clocked in for " + date);
        }

        AttendanceSource source = request.source() != null ? request.source() : AttendanceSource.WEB;

        Instant clockInInstant = request.clockInTime().atZone(EAT).toInstant();
        AttendanceRecord record = AttendanceRecord.createClockIn(
                tenantId, employeeId, clockInInstant, source);

        if (request.latitude() != null && request.longitude() != null) {
            record.setLocation(ClockType.CLOCK_IN,
                    request.latitude(), request.longitude());
        }

        if (request.notes() != null) {
            record.addNote(request.notes());
        }

        // Check lateness
        WorkSchedule schedule = scheduleRepository
                .findByTenantIdAndDefaultScheduleTrue(tenantId)
                .orElse(null);

        if (schedule != null) {
            LocalTime clockInTime = request.clockInTime().toLocalTime();
            LocalTime expectedStart = schedule.getStartTime();
            long minutesLate = ChronoUnit.MINUTES.between(expectedStart, clockInTime);
            if (minutesLate > 0 && minutesLate > schedule.getLateThresholdMinutes()) {
                record.markLate((int) minutesLate);
            }
        }

        record = recordRepository.save(record);
        eventPublisher.publishClockIn(record);

        log.info("Clock in recorded for employee {} at {}", employeeId, request.clockInTime());
        return mapper.toResponse(record);
    }

    @Transactional
    public AttendanceResponse clockOut(UUID employeeId, ClockOutRequest request) {
        String tenantId = TenantContext.requireTenantId();
        LocalDate date = request.clockOutTime().toLocalDate();

        AttendanceRecord record = recordRepository
                .findByTenantIdAndEmployeeIdAndAttendanceDate(tenantId, employeeId, date)
                .orElseThrow(() -> new BusinessRuleException("NO_CLOCK_IN",
                        "No clock-in found for " + date + ". Clock in first."));

        if (record.getClockIn() == null) {
            throw new BusinessRuleException("NO_CLOCK_IN",
                    "No clock-in found for " + date + ". Employee is marked absent or on leave.");
        }

        WorkSchedule schedule = scheduleRepository
                .findByTenantIdAndDefaultScheduleTrue(tenantId)
                .orElse(null);

        BigDecimal standardHours = schedule != null ? schedule.getHoursPerDay() : new BigDecimal("8.0");

        AttendanceSource source = request.source() != null ? request.source() : AttendanceSource.WEB;

        Instant clockOutInstant = request.clockOutTime().atZone(EAT).toInstant();
        record.clockOut(clockOutInstant, source, standardHours);

        if (request.latitude() != null && request.longitude() != null) {
            record.setLocation(ClockType.CLOCK_OUT,
                    request.latitude(), request.longitude());
        }

        // Check early departure
        if (schedule != null) {
            LocalTime clockOutTime = request.clockOutTime().toLocalTime();
            if (clockOutTime.isBefore(schedule.getEndTime().minusMinutes(15))) {
                record.markEarlyDeparture();
            }
        }

        record = recordRepository.save(record);
        eventPublisher.publishClockOut(record);

        log.info("Clock out recorded for employee {}. Hours: {}", employeeId, record.getHoursWorked());
        return mapper.toResponse(record);
    }

    public Page<AttendanceResponse> getEmployeeAttendance(UUID employeeId, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return recordRepository
                .findByTenantIdAndEmployeeIdOrderByAttendanceDateDesc(tenantId, employeeId, pageable)
                .map(mapper::toResponse);
    }

    public Page<AttendanceResponse> getDailyAttendance(LocalDate date, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return recordRepository
                .findByTenantIdAndAttendanceDateOrderByClockInDesc(tenantId, date, pageable)
                .map(mapper::toResponse);
    }

    public MonthlySummaryResponse getMonthlySummary(UUID employeeId, String period) {
        String tenantId = TenantContext.requireTenantId();
        YearMonth ym = YearMonth.parse(period);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        int present = recordRepository.countPresentDays(tenantId, employeeId, startDate, endDate);
        int absent = recordRepository.countAbsentDays(tenantId, employeeId, startDate, endDate);
        int daysOnLeave = recordRepository.countLeaveDays(tenantId, employeeId, startDate, endDate);
        int daysHoliday = recordRepository.countHolidayDays(tenantId, employeeId, startDate, endDate);
        int lateDays = recordRepository.countLateDays(tenantId, employeeId, startDate, endDate);
        int earlyDepartureDays = recordRepository.countEarlyDepartureDays(tenantId, employeeId, startDate, endDate);
        BigDecimal regular = recordRepository.sumRegularHours(tenantId, employeeId, startDate, endDate);
        BigDecimal overtimeWeekday = recordRepository.sumWeekdayOvertime(tenantId, employeeId, startDate, endDate);
        BigDecimal overtimeWeekend = recordRepository.sumWeekendOvertime(tenantId, employeeId, startDate, endDate);
        BigDecimal holidayHours = recordRepository.sumHolidayHours(tenantId, employeeId, startDate, endDate);
        BigDecimal totalHours = regular.add(overtimeWeekday).add(overtimeWeekend).add(holidayHours);

        return new MonthlySummaryResponse(
                employeeId, period, present, absent, daysOnLeave, daysHoliday,
                totalHours, regular, overtimeWeekday, overtimeWeekend, holidayHours,
                lateDays, earlyDepartureDays
        );
    }

    @Transactional
    public void createDefaultSchedule(String tenantId) {
        if (scheduleRepository.findByTenantIdAndDefaultScheduleTrue(tenantId).isPresent()) {
            return;
        }
        scheduleRepository.save(WorkSchedule.createDefault(tenantId));
    }

    @Transactional
    public void markLeaveDay(String tenantId, UUID employeeId, LocalDate date) {
        var existing = recordRepository.findByTenantIdAndEmployeeIdAndAttendanceDate(
                tenantId, employeeId, date);

        if (existing.isEmpty()) {
            AttendanceRecord record = AttendanceRecord.markOnLeave(tenantId, employeeId, date);
            recordRepository.save(record);
        }
    }
}