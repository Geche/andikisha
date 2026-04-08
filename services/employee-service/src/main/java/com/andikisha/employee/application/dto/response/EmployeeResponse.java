package com.andikisha.employee.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Public employee view — PII fields (nationalId, kraPin, nhifNumber, nssfNumber)
 * are intentionally excluded. Use {@link EmployeeDetailResponse} for HR-admin
 * endpoints that require the full record.
 */
public record EmployeeResponse(
        UUID id,
        String tenantId,
        String employeeNumber,
        String firstName,
        String lastName,
        String phoneNumber,
        String email,
        LocalDate dateOfBirth,
        String gender,
        UUID departmentId,
        String departmentName,
        UUID positionId,
        String positionTitle,
        String employmentType,
        String status,
        BigDecimal basicSalary,
        BigDecimal housingAllowance,
        BigDecimal transportAllowance,
        BigDecimal medicalAllowance,
        BigDecimal otherAllowances,
        BigDecimal grossPay,
        String currency,
        LocalDate hireDate,
        LocalDate probationEndDate,
        LocalDate terminationDate,
        String bankName,
        String bankAccountNumber,
        LocalDateTime createdAt
) {}
