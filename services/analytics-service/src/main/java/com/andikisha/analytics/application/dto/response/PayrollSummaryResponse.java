package com.andikisha.analytics.application.dto.response;

import java.math.BigDecimal;

public record PayrollSummaryResponse(
        String period,
        int employeeCount,
        BigDecimal totalGross,
        BigDecimal totalNet,
        BigDecimal totalPaye,
        BigDecimal totalNssf,
        BigDecimal totalShif,
        BigDecimal totalHousingLevy,
        BigDecimal averageGross,
        BigDecimal averageNet,
        String currency,
        String payrollRunId,
        String approvedBy
) {}
