package com.andikisha.tenant.application.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TenantDetailResponse(
        UUID tenantId,
        String organisationName,
        String workspace,
        String status,
        LocalDateTime createdAt,
        String adminEmail,
        String adminPhone,
        String kraPin,
        String nssfNumber,
        String shifNumber,
        String payFrequency,
        int payDay,
        String suspensionReason,
        LocalDate trialEndsAt,
        LicenceResponse currentLicence
) {}
