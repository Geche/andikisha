package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateEmployeeRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "National ID is required")
        @Pattern(regexp = "^\\d{6,10}$", message = "National ID must be 6 to 10 digits")
        String nationalId,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(\\+254|0)7\\d{8}$", message = "Must be valid Kenyan phone number")
        String phoneNumber,

        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "KRA PIN is required")
        @Pattern(regexp = "^[A-Z]\\d{9}[A-Z]$", message = "Invalid KRA PIN format")
        String kraPin,

        @NotBlank(message = "NHIF number is required") String nhifNumber,
        @NotBlank(message = "NSSF number is required") String nssfNumber,

        @NotNull(message = "Employment type is required") String employmentType,

        @NotNull(message = "Basic salary is required")
        @Positive(message = "Salary must be positive")
        BigDecimal basicSalary,

        BigDecimal housingAllowance,
        BigDecimal transportAllowance,
        BigDecimal medicalAllowance,
        BigDecimal otherAllowances,

        String currency,
        UUID departmentId,
        UUID positionId,
        LocalDate hireDate,
        LocalDate dateOfBirth,
        String gender
) {}
