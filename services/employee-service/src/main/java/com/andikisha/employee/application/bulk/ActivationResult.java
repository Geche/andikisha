package com.andikisha.employee.application.bulk;

import java.util.UUID;

public record ActivationResult(
        UUID employeeId,
        String employeeName,
        String email,
        String tempPassword,
        boolean success,
        String errorMessage) {}
