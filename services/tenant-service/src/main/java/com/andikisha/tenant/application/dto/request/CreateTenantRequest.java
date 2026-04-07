package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateTenantRequest(
        @NotBlank(message = "Company name is required")
        @Size(max = 200)
        String companyName,

        @NotBlank(message = "Country is required")
        @Size(min = 2, max = 5)
        String country,

        @NotBlank(message = "Currency is required")
        @Size(min = 3, max = 3)
        String currency,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid email format")
        String adminEmail,

        @NotBlank(message = "Admin phone is required")
        @Pattern(regexp = "^(\\+254|0)7\\d{8}$",
                message = "Must be a valid phone number")
        String adminPhone,

        String planName
) {}
