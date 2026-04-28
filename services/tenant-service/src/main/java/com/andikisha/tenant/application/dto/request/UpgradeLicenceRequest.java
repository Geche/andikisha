package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record UpgradeLicenceRequest(

        @NotNull(message = "New plan id is required")
        UUID newPlanId,

        @Min(value = 1, message = "Seat count must be at least 1")
        int seatCount,

        @NotNull(message = "Agreed price is required")
        @DecimalMin(value = "0.0", inclusive = true)
        BigDecimal agreedPriceKes
) {}
