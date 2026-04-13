package com.andikisha.compliance.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TaxBracketResponse(
        int bandNumber,
        BigDecimal lowerBound,
        BigDecimal upperBound,
        BigDecimal rate,
        LocalDate effectiveFrom
) {}