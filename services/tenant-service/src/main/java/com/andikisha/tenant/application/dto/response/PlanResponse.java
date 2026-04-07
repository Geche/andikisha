package com.andikisha.tenant.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record PlanResponse(
        UUID id,
        String name,
        String tier,
        BigDecimal monthlyPrice,
        String currency,
        int maxEmployees,
        int maxAdmins,
        boolean payrollEnabled,
        boolean leaveEnabled,
        boolean attendanceEnabled,
        boolean documentsEnabled,
        boolean analyticsEnabled
) {}