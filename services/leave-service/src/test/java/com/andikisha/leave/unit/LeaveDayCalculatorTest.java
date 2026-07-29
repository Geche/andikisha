package com.andikisha.leave.unit;

import com.andikisha.leave.domain.model.LeaveDayCalculator;
import com.andikisha.leave.domain.model.LeaveType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * LEAVE-BACKLOG-002 Phase 1: working-day types (annual/sick/compassionate/study) exclude weekends;
 * block-grant/calendar types (maternity/paternity/unpaid) count every inclusive calendar day.
 * Public-holiday exclusion is Phase 2. Dates are fixed and weekday-verified:
 * 2026-01-05 is a Monday, so 01-05..01-09 is Mon–Fri and 01-10/01-11 is the weekend.
 */
class LeaveDayCalculatorTest {

    private static final LocalDate MON = LocalDate.of(2026, 1, 5);   // Monday
    private static final LocalDate WED = LocalDate.of(2026, 1, 7);   // Wednesday
    private static final LocalDate FRI = LocalDate.of(2026, 1, 9);   // Friday
    private static final LocalDate SAT = LocalDate.of(2026, 1, 10);  // Saturday
    private static final LocalDate NEXT_MON = LocalDate.of(2026, 1, 12); // following Monday

    @Test
    void annual_monToFri_countsFiveWorkingDays() {
        assertThat(LeaveDayCalculator.countDays(LeaveType.ANNUAL, MON, FRI))
                .isEqualByComparingTo("5");
    }

    @Test
    void annual_friToMon_excludesTheWeekend() {
        // Fri, Sat, Sun, Mon = 4 calendar days but only 2 working days.
        assertThat(LeaveDayCalculator.countDays(LeaveType.ANNUAL, FRI, NEXT_MON))
                .isEqualByComparingTo("2");
    }

    @Test
    void annual_singleWeekday_countsOne() {
        assertThat(LeaveDayCalculator.countDays(LeaveType.ANNUAL, WED, WED))
                .isEqualByComparingTo("1");
    }

    @Test
    void annual_singleWeekendDay_countsZero() {
        assertThat(LeaveDayCalculator.countDays(LeaveType.ANNUAL, SAT, SAT))
                .isEqualByComparingTo("0");
    }

    @Test
    void annual_twoWeekBlock_excludesBothWeekends() {
        // 2026-01-05 (Mon) .. 2026-01-19 (Mon) = 15 calendar days, 11 working days.
        assertThat(LeaveDayCalculator.countDays(LeaveType.ANNUAL, MON, LocalDate.of(2026, 1, 19)))
                .isEqualByComparingTo("11");
    }

    @Test
    void sick_isWorkingDayBased() {
        assertThat(LeaveDayCalculator.countDays(LeaveType.SICK, FRI, NEXT_MON))
                .isEqualByComparingTo("2");
    }

    @Test
    void maternity_countsInclusiveCalendarDays() {
        // Block grant — weekends included.
        assertThat(LeaveDayCalculator.countDays(LeaveType.MATERNITY, FRI, NEXT_MON))
                .isEqualByComparingTo("4");
    }

    @Test
    void paternity_countsInclusiveCalendarDays() {
        assertThat(LeaveDayCalculator.countDays(LeaveType.PATERNITY, FRI, NEXT_MON))
                .isEqualByComparingTo("4");
    }

    @Test
    void unpaid_staysCalendarBasis_forPayrollConsistency() {
        // UNPAID pins to the PAYROLL-BACKLOG-001 pay deduction, which is calendar-based.
        assertThat(LeaveDayCalculator.countDays(LeaveType.UNPAID, FRI, NEXT_MON))
                .isEqualByComparingTo("4");
    }

    @Test
    void endBeforeStart_throws() {
        assertThatThrownBy(() -> LeaveDayCalculator.countDays(LeaveType.ANNUAL, FRI, MON))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
