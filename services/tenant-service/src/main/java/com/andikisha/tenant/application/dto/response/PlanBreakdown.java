package com.andikisha.tenant.application.dto.response;

import java.math.BigDecimal;

public record PlanBreakdown(
        String planName,
        long tenantCount,
        BigDecimal mrrKes
) {}
