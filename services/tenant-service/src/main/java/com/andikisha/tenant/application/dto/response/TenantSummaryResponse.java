package com.andikisha.tenant.application.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TenantSummaryResponse(
        UUID tenantId,
        String organisationName,
        String status,
        String planName,
        Integer seatCount,
        LocalDate endDate,
        String adminEmail,
        LocalDateTime createdAt
) {}
