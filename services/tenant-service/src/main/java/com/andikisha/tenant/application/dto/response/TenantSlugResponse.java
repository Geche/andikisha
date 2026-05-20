package com.andikisha.tenant.application.dto.response;

public record TenantSlugResponse(
        String tenantId,
        String organisationName,
        String status
) {}
