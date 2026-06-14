package com.andikisha.auth.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * R3-2c (TENANT-006): invite a standalone admin-tier user (no employee record). The role
 * must be one of Role.ADMIN_TIER — enforced in the service, not here, so the rejection
 * carries a domain error code. Phone is required (users.phone_number is NOT NULL/unique).
 */
public record InviteUserRequest(
        @NotBlank(message = "email is required")
        @Email(message = "Must be a valid email")
        String email,

        @NotBlank(message = "phone number is required")
        @Pattern(regexp = "^(\\+254|0)7\\d{8}$", message = "Must be a valid Kenyan phone number")
        String phoneNumber,

        @NotBlank(message = "role is required")
        String role
) {}
