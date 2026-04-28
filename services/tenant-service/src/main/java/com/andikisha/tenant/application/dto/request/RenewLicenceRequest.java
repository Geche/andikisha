package com.andikisha.tenant.application.dto.request;

import com.andikisha.common.domain.model.BillingCycle;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RenewLicenceRequest(

        @NotNull(message = "Plan id is required")
        UUID planId,

        @NotNull(message = "Billing cycle is required")
        BillingCycle billingCycle,

        @Min(value = 1, message = "Seat count must be at least 1")
        int seatCount,

        @NotNull(message = "Agreed price is required")
        @DecimalMin(value = "0.0", inclusive = true)
        BigDecimal agreedPriceKes,

        @NotNull(message = "New end date is required")
        LocalDate newEndDate
) {}
