package com.andikisha.tenant.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpiringLicenceResponse(
        UUID tenantId,
        String organisationName,
        String planName,
        LocalDate endDate,
        long daysUntilExpiry,
        int seatCount,
        BigDecimal agreedPriceKes,
        String adminEmail
) {}
