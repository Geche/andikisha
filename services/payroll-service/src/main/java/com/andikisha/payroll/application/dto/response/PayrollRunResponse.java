package com.andikisha.payroll.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PayrollRunResponse(
        UUID id,
        String period,
        String payFrequency,
        String status,
        int employeeCount,
        BigDecimal totalGross,
        BigDecimal totalBasic,
        BigDecimal totalAllowances,
        BigDecimal totalPaye,
        BigDecimal totalNssf,
        BigDecimal totalShif,
        BigDecimal totalHousingLevy,
        BigDecimal totalNet,
        String currency,
        String initiatedBy,
        String approvedBy,
        LocalDateTime approvedAt,
        LocalDateTime completedAt,
        LocalDateTime createdAt
) {}