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