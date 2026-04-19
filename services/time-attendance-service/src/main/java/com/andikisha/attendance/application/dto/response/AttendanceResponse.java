package com.andikisha.attendance.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AttendanceResponse(
        UUID id,
        UUID employeeId,
        LocalDate attendanceDate,
        LocalDateTime clockIn,
        LocalDateTime clockOut,
        String clockInSource,
        String clockOutSource,
        BigDecimal hoursWorked,
        BigDecimal regularHours,
        BigDecimal overtimeHours,
        boolean late,
        Integer lateMinutes,
        boolean earlyDeparture,
        boolean absent,
        boolean onLeave,
        boolean holiday,
        String notes,
        boolean approved
) {}