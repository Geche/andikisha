package com.andikisha.tenant.application.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TenantResponse(
        UUID id,
        String companyName,
        String country,
        String currency,
        String kraPin,
        String nssfNumber,
        String shifNumber,
        String adminEmail,
        String adminPhone,
        String status,
        String planName,
        String planTier,
        LocalDate trialEndsAt,
        String payFrequency,
        int payDay,
        LocalDateTime createdAt
) {}