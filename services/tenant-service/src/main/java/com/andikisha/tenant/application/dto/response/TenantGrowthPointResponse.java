package com.andikisha.tenant.application.dto.response;

public record TenantGrowthPointResponse(
        String month,
        long newSignups,
        long activeTenants
) {}
