package com.andikisha.tenant.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record TenantDetailResponse(
        UUID tenantId,
        String organisationName,
        String status,
        LocalDateTime createdAt,
        LicenceResponse currentLicence
) {}
