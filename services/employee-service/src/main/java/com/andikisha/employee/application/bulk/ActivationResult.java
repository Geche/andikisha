package com.andikisha.employee.application.bulk;

import java.util.UUID;

public record ActivationResult(
        UUID employeeId,
        String employeeName,
        String email,
        String tempPassword,
        boolean success,
        String errorCode,    // machine-readable error code for frontend branching (e.g. USER_ALREADY_ACTIVATED)
        String errorMessage) {}
