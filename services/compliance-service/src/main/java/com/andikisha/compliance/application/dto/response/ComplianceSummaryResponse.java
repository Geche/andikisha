package com.andikisha.compliance.application.dto.response;

import java.util.List;

public record ComplianceSummaryResponse(
        String country,
        String effectiveDate,
        List<TaxBracketResponse> taxBrackets,
        List<StatutoryRateResponse> statutoryRates,
        List<TaxReliefResponse> taxReliefs
) {}