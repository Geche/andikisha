package com.andikisha.analytics.application.dto.response;

import java.math.BigDecimal;

public record LeaveAnalyticsResponse(
        String period,
        String leaveType,
        int requestsSubmitted,
        int requestsApproved,
        int requestsRejected,
        BigDecimal totalDaysTaken,
        int uniqueEmployees,
        BigDecimal averageDaysPerRequest,
        BigDecimal approvalRate
) {}
