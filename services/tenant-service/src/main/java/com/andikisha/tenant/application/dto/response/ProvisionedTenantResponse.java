package com.andikisha.tenant.application.dto.response;

import com.andikisha.common.domain.model.LicenceStatus;

import java.time.LocalDate;
import java.util.UUID;

public record ProvisionedTenantResponse(
        UUID tenantId,
        String organisationName,
        UUID licenceKey,
        LicenceStatus licenceStatus,
        String planName,
        String adminEmail,
        String temporaryPassword,
        int seatCount,
        LocalDate endDate
) {}
