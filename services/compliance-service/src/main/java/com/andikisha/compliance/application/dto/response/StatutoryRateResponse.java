package com.andikisha.compliance.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StatutoryRateResponse(
        String rateType,
        BigDecimal rateValue,
        BigDecimal limitAmount,
        BigDecimal secondaryLimit,
        BigDecimal fixedAmount,
        String description,
        LocalDate effectiveFrom
) {}