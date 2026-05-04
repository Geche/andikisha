package com.andikisha.attendance.application.mapper;

import com.andikisha.attendance.application.dto.response.AttendanceResponse;
import com.andikisha.attendance.domain.model.AttendanceRecord;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T19:57:14+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class AttendanceMapperImpl implements AttendanceMapper {

    @Override
    public AttendanceResponse toResponse(AttendanceRecord r) {
        if ( r == null ) {
            return null;
        }

        UUID id = null;
        UUID employeeId = null;
        LocalDate attendanceDate = null;
        Instant clockIn = null;
        Instant clockOut = null;
        BigDecimal hoursWorked = null;
        BigDecimal regularHours = null;
        BigDecimal overtimeHours = null;
        boolean late = false;
        Integer lateMinutes = null;
        boolean earlyDeparture = false;
        boolean absent = false;
        boolean onLeave = false;
        boolean holiday = false;
        String notes = null;
        boolean approved = false;

        id = r.getId();
        employeeId = r.getEmployeeId();
        attendanceDate = r.getAttendanceDate();
        clockIn = r.getClockIn();
        clockOut = r.getClockOut();
        hoursWorked = r.getHoursWorked();
        regularHours = r.getRegularHours();
        overtimeHours = r.getOvertimeHours();
        late = r.isLate();
        lateMinutes = r.getLateMinutes();
        earlyDeparture = r.isEarlyDeparture();
        absent = r.isAbsent();
        onLeave = r.isOnLeave();
        holiday = r.isHoliday();
        notes = r.getNotes();
        approved = r.isApproved();

        String clockInSource = r.getClockInSource() != null ? r.getClockInSource().name() : null;
        String clockOutSource = r.getClockOutSource() != null ? r.getClockOutSource().name() : null;

        AttendanceResponse attendanceResponse = new AttendanceResponse( id, employeeId, attendanceDate, clockIn, clockOut, clockInSource, clockOutSource, hoursWorked, regularHours, overtimeHours, late, lateMinutes, earlyDeparture, absent, onLeave, holiday, notes, approved );

        return attendanceResponse;
    }
}
