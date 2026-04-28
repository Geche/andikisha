package com.andikisha.tenant.application.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SuperAdminAnalyticsResponse(
        long totalActiveTenants,
        long totalTrialTenants,
        long totalSuspendedTenants,
        long totalExpiredTenants,
        long totalCancelledTenants,
        BigDecimal mrrKes,
        BigDecimal arrKes,
        long totalSeatsLicensed,
        long totalSeatsUsed,
        List<PlanBreakdown> planBreakdown,
        long newTenantsThisMonth,
        long churnsThisMonth
) {}
