package com.andikisha.tenant.application.dto.response;

public record DashboardMetricsResponse(
        long totalTenants,
        long activeTenants,
        long trialsExpiringIn7Days,
        long trialsExpiringIn48Hours,
        long suspendedTenants,
        long tenantDeltaThisMonth,
        long activeDeltaThisMonth
) {}
