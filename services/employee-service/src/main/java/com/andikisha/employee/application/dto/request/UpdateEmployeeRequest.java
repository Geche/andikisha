package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateEmployeeRequest(
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,

        @Pattern(regexp = "^(\\+254|0)7\\d{8}$", message = "Must be valid Kenyan phone number")
        String phoneNumber,

        @Email String email,
        LocalDate dateOfBirth,
        String gender,
        UUID departmentId,
        UUID positionId,
        String bankName,
        String bankAccountNumber,
        String bankBranch,

        // Statutory IDs — only accepted if employee has no processed payslips.
        // The gateway enforces this at the UI layer; the service applies them unconditionally
        // since the caller has already verified eligibility.
        // KRA PIN format validated to match CreateEmployeeRequest (EMP-BACKLOG-004);
        // optional on update — null/empty allowed, non-empty must match.
        @Pattern(regexp = "^([A-Z]\\d{9}[A-Z])?$", message = "Invalid KRA PIN format (e.g. A123456789X)")
        String kraPin,
        String nhifNumber,
        String nssfNumber
) {}
