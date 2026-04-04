package com.andikisha.auth.domain.model;

public enum Role {

    // Platform-level
    SUPER_ADMIN,

    // HR & Administration
    ADMIN,
    HR_MANAGER,
    HR_OFFICER,

    // Payroll & Finance
    PAYROLL_MANAGER,
    PAYROLL_OFFICER,
    FINANCE_OFFICER,

    // Management
    LINE_MANAGER,
    MANAGER,
    CHIEF_MANAGER,
    CHIEF_OFFICER,

    // Audit & Integration
    AUDITOR,

    // Self-service
    EMPLOYEE
}