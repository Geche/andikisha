package com.andikisha.tenant.application.dto.response;

import com.andikisha.common.domain.model.BillingCycle;
import com.andikisha.common.domain.model.LicenceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record LicenceResponse(
        UUID licenceId,
        String tenantId,
        UUID planId,
        String planName,
        UUID licenceKey,
        BillingCycle billingCycle,
        int seatCount,
        BigDecimal agreedPriceKes,
        String currency,
        LocalDate startDate,
        LocalDate endDate,
        LicenceStatus status,
        LocalDateTime suspendedAt,
        String createdBy
) {}
