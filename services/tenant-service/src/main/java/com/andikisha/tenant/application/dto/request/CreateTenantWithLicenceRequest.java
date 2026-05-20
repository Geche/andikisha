package com.andikisha.tenant.application.dto.request;

import com.andikisha.common.domain.model.BillingCycle;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateTenantWithLicenceRequest(

        @NotBlank(message = "Organisation name is required")
        @Size(max = 200)
        String organisationName,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid email format")
        String adminEmail,

        @NotBlank(message = "Admin first name is required")
        @Size(max = 100)
        String adminFirstName,

        @NotBlank(message = "Admin last name is required")
        @Size(max = 100)
        String adminLastName,

        @NotBlank(message = "Admin phone is required")
        @Pattern(regexp = "^(\\+254|0)7\\d{8}$",
                message = "Must be a valid phone number")
        String adminPhone,

        @NotNull(message = "Plan id is required")
        UUID planId,

        @NotNull(message = "Billing cycle is required")
        BillingCycle billingCycle,

        @Min(value = 1, message = "Seat count must be at least 1")
        int seatCount,

        @NotNull(message = "Agreed price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Agreed price cannot be negative")
        BigDecimal agreedPriceKes,

        @Min(value = 0, message = "Trial days cannot be negative")
        int trialDays,

        @Pattern(
                regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
                message = "Workspace slug must be lowercase letters, numbers, and hyphens only"
        )
        @Size(max = 50, message = "Workspace slug must not exceed 50 characters")
        String workspaceSlug   // nullable — auto-generated from organisationName if null
) {}
