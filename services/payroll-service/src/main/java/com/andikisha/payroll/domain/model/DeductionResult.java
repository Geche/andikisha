package com.andikisha.payroll.domain.model;

import java.math.BigDecimal;

public record DeductionResult(
        BigDecimal grossPay,
        BigDecimal taxableIncome,
        BigDecimal payeBeforeRelief,
        BigDecimal personalRelief,
        BigDecimal insuranceRelief,
        BigDecimal netPaye,
        BigDecimal nssfEmployee,
        BigDecimal nssfEmployer,
        BigDecimal shif,
        BigDecimal housingLevyEmployee,
        BigDecimal housingLevyEmployer,
        BigDecimal totalDeductions,
        BigDecimal netPay
) {}