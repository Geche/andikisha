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
    FINANCE_OFFICER, // Reserved for future use

    // Management
    LINE_MANAGER,
    CHIEF_MANAGER,   // Reserved for future use
    CHIEF_OFFICER,   // Reserved for future use

    // Audit & Integration
    AUDITOR,         // Reserved for future use

    // Self-service
    EMPLOYEE
}