package com.andikisha.employee.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Full employee response including PII (nationalId, kraPin, nhifNumber, nssfNumber).
 * Only return this from endpoints that require HR Admin access.
 * Use {@link EmployeeResponse} for lower-privilege views.
 */
public record EmployeeDetailResponse(
        UUID id,
        String tenantId,
        String employeeNumber,
        String firstName,
        String lastName,
        String nationalId,
        String phoneNumber,
        String email,
        String kraPin,
        String nhifNumber,
        String nssfNumber,
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
