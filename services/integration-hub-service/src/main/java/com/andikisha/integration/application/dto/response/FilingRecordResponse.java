package com.andikisha.integration.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FilingRecordResponse(
        UUID id,
        String filingType,
        String period,
        String status,
        int employeeCount,
        BigDecimal totalAmount,
        BigDecimal employerAmount,
        String fileReference,
        String acknowledgmentNumber,
        Instant submittedAt,
        Instant confirmedAt,
        String errorMessage
) {}