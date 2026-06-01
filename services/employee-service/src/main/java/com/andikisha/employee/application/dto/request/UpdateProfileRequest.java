package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Tier-1 self-service profile fields.
 * These may be edited by the employee themselves (no HR required).
 * Tier-2 fields (bank, KRA PIN, NSSF, SHIF, legalName, DOB, nationalId) are absent
 * by design — they are HR-edit-only via PUT /api/v1/employees/{id}.
 */
public record UpdateProfileRequest(
        @Pattern(regexp = "^(\\+254|0)7\\d{8}$", message = "Must be a valid Kenyan phone number")
        String phoneNumber,

        @Email(message = "Must be a valid email address")
        @Size(max = 255)
        String personalEmail,

        @Size(max = 200)
        String emergencyContactName,

        @Pattern(regexp = "^(\\+254|0)7\\d{8}$|^$",
                 message = "Must be a valid Kenyan phone number or empty")
        @Size(max = 20)
        String emergencyContactPhone
) {}
