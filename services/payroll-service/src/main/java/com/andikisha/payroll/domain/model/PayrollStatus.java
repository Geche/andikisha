package com.andikisha.payroll.domain.model;

public enum PayrollStatus {
    DRAFT,
    CALCULATING,
    CALCULATED,
    APPROVED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}