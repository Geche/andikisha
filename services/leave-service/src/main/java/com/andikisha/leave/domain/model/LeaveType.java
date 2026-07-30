package com.andikisha.leave.domain.model;

public enum LeaveType {
    ANNUAL,
    SICK,
    MATERNITY,
    PATERNITY,
    COMPASSIONATE,
    UNPAID,
    STUDY;

    /**
     * Only annual leave accrues monthly and pro-rates by join date. Statutory and
     * event-based types are granted as a whole-day entitlement — pro-rating or
     * accruing them produced nonsensical fractional balances (e.g. 9.3 paternity days).
     */
    public boolean accruesMonthly() {
        return this == ANNUAL;
    }

    /**
     * Whether this type is counted in working days (weekends excluded) rather than inclusive
     * calendar days (LEAVE-BACKLOG-002). Annual is 21 <em>working</em> days under the Employment
     * Act Cap 226 s.28; sick/compassionate/study follow the same working-day basis. The statutory
     * block grants (maternity 90, paternity 14) are continuous calendar-day periods. UNPAID stays
     * calendar-based to remain in lockstep with the PAYROLL-BACKLOG-001 pay deduction.
     * Phase 1 excludes weekends only; public-holiday exclusion is Phase 2.
     */
    public boolean countsWorkingDays() {
        return switch (this) {
            case ANNUAL, SICK, COMPASSIONATE, STUDY -> true;
            case MATERNITY, PATERNITY, UNPAID -> false;
        };
    }

    /**
     * Gender required for statutory parental leave, as the case-insensitive employee
     * gender string from employee-service ("MALE" / "FEMALE"); null = available to all.
     */
    public String restrictedToGender() {
        return switch (this) {
            case MATERNITY -> "FEMALE";
            case PATERNITY -> "MALE";
            default -> null;
        };
    }
}