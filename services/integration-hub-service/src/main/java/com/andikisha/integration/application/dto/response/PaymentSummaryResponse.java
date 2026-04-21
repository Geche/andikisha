package com.andikisha.integration.application.dto.response;

import java.math.BigDecimal;

public record PaymentSummaryResponse(
        long totalTransactions,
        long completed,
        long failed,
        long pending,
        long mpesaCount,
        long bankTransferCount,
        BigDecimal totalAmount,
        BigDecimal completedAmount
) {}
