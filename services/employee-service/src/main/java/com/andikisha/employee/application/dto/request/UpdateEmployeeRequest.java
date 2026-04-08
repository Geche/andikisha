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
        String bankBranch
) {}
