package com.andikisha.employee.application.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record EmployeeSummaryResponse(
        UUID id,
        String employeeNumber,
        String firstName,
        String lastName,
        String phoneNumber,
        String departmentName,
        String positionTitle,
        String status,
        LocalDate hireDate
) {}
