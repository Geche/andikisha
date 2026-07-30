package com.andikisha.leave.domain.model;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Counts the chargeable days for a leave request (LEAVE-BACKLOG-002).
 *
 * <p>Working-day types (see {@link LeaveType#countsWorkingDays()}) exclude Saturdays and Sundays,
 * so a range spanning a weekend no longer over-charges the balance — annual leave is 21
 * <em>working</em> days under the Employment Act Cap 226 s.28. Block-grant/calendar types
 * (maternity, paternity, unpaid) count every inclusive calendar day.
 *
 * <p>Phase 1 excludes weekends only. Public-holiday exclusion is Phase 2, once the shared
 * {@code public_holidays}/{@code CalendarService} (deferred by PAYROLL-BACKLOG-001) exists;
 * that will add a holidays parameter here rather than changing any caller.
 *
 * <p>Decision: {@code docs/decisions/2026-07-29-leave-day-counting-basis.md}.
 */
public final class LeaveDayCalculator {

    private LeaveDayCalculator() {
    }

    /**
     * @param type  the leave type, which selects the working-day vs calendar-day basis
     * @param start inclusive start date
     * @param end   inclusive end date (must not be before {@code start})
     * @return the chargeable day count for the range
     * @throws IllegalArgumentException if {@code end} is before {@code start}
     */
    public static BigDecimal countDays(LeaveType type, LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new IllegalArgumentException(
                    "Leave end date " + end + " is before start date " + start);
        }

        if (!type.countsWorkingDays()) {
            return BigDecimal.valueOf(ChronoUnit.DAYS.between(start, end) + 1);
        }

        long workingDays = 0;
        for (LocalDate day = start; !day.isAfter(end); day = day.plusDays(1)) {
            DayOfWeek dow = day.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                workingDays++;
            }
        }
        return BigDecimal.valueOf(workingDays);
    }
}
