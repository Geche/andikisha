package com.andikisha.compliance.application.dto.response;

import java.math.BigDecimal;

public record TaxReliefResponse(
        String reliefType,
        BigDecimal monthlyAmount,
        BigDecimal rate,
        BigDecimal maxAmount,
        String description
) {}