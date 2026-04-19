package com.andikisha.attendance.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record MonthlySummaryResponse(
        UUID employeeId,
        String period,
        int daysPresent,
        int daysAbsent,
        int daysOnLeave,
        int daysHoliday,
        BigDecimal totalHoursWorked,
        BigDecimal regularHours,
        BigDecimal overtimeWeekday,
        BigDecimal overtimeWeekend,
        BigDecimal overtimeHoliday,
        int lateDays,
        int earlyDepartureDays
) {}
