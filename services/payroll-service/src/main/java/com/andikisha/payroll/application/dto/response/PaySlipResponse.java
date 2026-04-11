package com.andikisha.payroll.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record PaySlipResponse(
        UUID id,
        UUID payrollRunId,
        String period,
        UUID employeeId,
        String employeeNumber,
        String employeeName,
        BigDecimal basicPay,
        BigDecimal housingAllowance,
        BigDecimal transportAllowance,
        BigDecimal medicalAllowance,
        BigDecimal otherAllowances,
        BigDecimal totalAllowances,
        BigDecimal grossPay,
        BigDecimal paye,
        BigDecimal nssf,
        BigDecimal nssfEmployer,
        BigDecimal shif,
        BigDecimal housingLevy,
        BigDecimal housingLevyEmployer,
        BigDecimal helb,
        BigDecimal personalRelief,
        BigDecimal insuranceRelief,
        BigDecimal totalDeductions,
        BigDecimal netPay,
        String currency,
        String paymentStatus,
        String mpesaReceipt
) {}