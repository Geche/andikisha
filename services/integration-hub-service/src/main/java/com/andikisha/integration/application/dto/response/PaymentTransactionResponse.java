package com.andikisha.integration.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentTransactionResponse(
        UUID id,
        UUID payrollRunId,
        UUID paySlipId,
        UUID employeeId,
        String employeeName,
        String paymentMethod,
        String phoneNumber,
        BigDecimal amount,
        String currency,
        String status,
        String externalReference,
        String providerReceipt,
        String errorMessage,
        Instant submittedAt,
        Instant completedAt,
        int retryCount
) {}