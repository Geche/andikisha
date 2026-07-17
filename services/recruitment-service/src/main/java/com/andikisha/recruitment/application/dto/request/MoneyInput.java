package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/** A monetary amount at the API boundary; mapped to the {@link com.andikisha.common.domain.Money} value object. */
public record MoneyInput(
        @NotNull @PositiveOrZero BigDecimal amount,
        @NotBlank String currency
) {}
