package com.andikisha.attendance.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "clock_in")
    private LocalDateTime clockIn;

    @Column(name = "clock_out")
    private LocalDateTime clockOut;

    @Enumerated(EnumType.STRING)
    @Column(name = "clock_in_source", length = 20)
    private AttendanceSource clockInSource;

    @Enumerated(EnumType.STRING)
    @Column(name = "clock_out_source", length = 20)
    private AttendanceSource clockOutSource;

    @Column(name = "clock_in_latitude")
    private Double clockInLatitude;

    @Column(name = "clock_in_longitude")
    private Double clockInLongitude;

    @Column(name = "clock_out_latitude")
    private Double clockOutLatitude;

    @Column(name = "clock_out_longitude")
    private Double clockOutLongitude;

    @Column(name = "hours_worked", precision = 5, scale = 2)
    private BigDecimal hoursWorked;

    @Column(name = "regular_hours", precision = 5, scale = 2)
    private BigDecimal regularHours;

    @Column(name = "overtime_hours", precision = 5, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "is_late", nullable = false)
    private boolean late = false;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @Column(name = "is_early_departure", nullable = false)
    private boolean earlyDeparture = false;

    @Column(name = "is_absent", nullable = false)
    private boolean absent = false;

    @Column(name = "is_on_leave", nullable = false)
    private boolean onLeave = false;

    @Column(name = "is_holiday", nullable = false)
    private boolean holiday = false;

    @Column(length = 500)
    private String notes;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "is_approved", nullable = false)
    private boolean approved = false;

    protected AttendanceRecord() {}

    public static AttendanceRecord createClockIn(String tenantId, UUID employeeId,
                                                 LocalDateTime clockIn,
                                                 AttendanceSource source) {
        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.employeeId = employeeId;
        record.attendanceDate = clockIn.toLocalDate();
        record.clockIn = clockIn;
        record.clockInSource = source;
        record.hoursWorked = BigDecimal.ZERO;
        record.regularHours = BigDecimal.ZERO;
        record.overtimeHours = BigDecimal.ZERO;
        return record;
    }

    public static AttendanceRecord markAbsent(String tenantId, UUID employeeId,
                                              LocalDate date) {
        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.employeeId = employeeId;
        record.attendanceDate = date;
        record.absent = true;
        record.hoursWorked = BigDecimal.ZERO;
        record.regularHours = BigDecimal.ZERO;
        record.overtimeHours = BigDecimal.ZERO;
        return record;
    }

    public static AttendanceRecord markOnLeave(String tenantId, UUID employeeId,
                                               LocalDate date) {
        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.employeeId = employeeId;
        record.attendanceDate = date;
        record.onLeave = true;
        record.hoursWorked = BigDecimal.ZERO;
        record.regularHours = BigDecimal.ZERO;
        record.overtimeHours = BigDecimal.ZERO;
        return record;
    }

    public static AttendanceRecord markHoliday(String tenantId, UUID employeeId,
                                               LocalDate date, String holidayName) {
        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.employeeId = employeeId;
        record.attendanceDate = date;
        record.holiday = true;
        record.notes = holidayName;
        record.hoursWorked = BigDecimal.ZERO;
        record.regularHours = BigDecimal.ZERO;
        record.overtimeHours = BigDecimal.ZERO;
        return record;
    }

    public void clockOut(LocalDateTime clockOut, AttendanceSource source,
                         BigDecimal standardHoursPerDay) {
        if (this.clockIn == null) {
            throw new BusinessRuleException("Cannot clock out without a clock-in");
        }
        if (this.clockOut != null) {
            throw new BusinessRuleException("Already clocked out for this record");
        }
        if (clockOut.isBefore(this.clockIn)) {
            throw new BusinessRuleException("Clock-out cannot be before clock-in");
        }

        this.clockOut = clockOut;
        this.clockOutSource = source;

        Duration duration = Duration.between(this.clockIn, clockOut);
        this.hoursWorked = BigDecimal.valueOf(duration.toMinutes())
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        if (this.hoursWorked.compareTo(standardHoursPerDay) > 0) {
            this.regularHours = standardHoursPerDay;
            this.overtimeHours = this.hoursWorked.subtract(standardHoursPerDay);
        } else {
            this.regularHours = this.hoursWorked;
            this.overtimeHours = BigDecimal.ZERO;
        }
    }

    public void setLocation(ClockType type, double latitude, double longitude) {
        if (type == ClockType.CLOCK_IN) {
            this.clockInLatitude = latitude;
            this.clockInLongitude = longitude;
        } else {
            this.clockOutLatitude = latitude;
            this.clockOutLongitude = longitude;
        }
    }

    public void markLate(int lateMinutes) {
        this.late = true;
        this.lateMinutes = lateMinutes;
    }

    public void markEarlyDeparture() {
        this.earlyDeparture = true;
    }

    public void approve(UUID approvedBy) {
        this.approved = true;
        this.approvedBy = approvedBy;
    }

    public void addNote(String note) {
        this.notes = note;
    }

    public UUID getEmployeeId() { return employeeId; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public LocalDateTime getClockIn() { return clockIn; }
    public LocalDateTime getClockOut() { return clockOut; }
    public AttendanceSource getClockInSource() { return clockInSource; }
    public AttendanceSource getClockOutSource() { return clockOutSource; }
    public Double getClockInLatitude() { return clockInLatitude; }
    public Double getClockInLongitude() { return clockInLongitude; }
    public BigDecimal getHoursWorked() { return hoursWorked; }
    public BigDecimal getRegularHours() { return regularHours; }
    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public boolean isLate() { return late; }
    public Integer getLateMinutes() { return lateMinutes; }
    public boolean isEarlyDeparture() { return earlyDeparture; }
    public boolean isAbsent() { return absent; }
    public boolean isOnLeave() { return onLeave; }
    public boolean isHoliday() { return holiday; }
    public String getNotes() { return notes; }
    public boolean isApproved() { return approved; }
    public UUID getApprovedBy() { return approvedBy; }
}