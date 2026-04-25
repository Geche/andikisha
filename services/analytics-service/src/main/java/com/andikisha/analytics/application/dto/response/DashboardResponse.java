package com.andikisha.analytics.application.dto.response;

import java.math.BigDecimal;

public record DashboardResponse(
        HeadcountSummary headcount,
        PayrollCostSummary payrollCost,
        LeaveSummary leave,
        AttendanceSummary attendance
) {
    public record HeadcountSummary(
            int totalHeadcount,
            int totalActive,
            int totalOnProbation,
            int newHiresThisMonth,
            int exitsThisMonth,
            int permanent,
            int contract,
            int casual
    ) {}

    public record PayrollCostSummary(
            String latestPeriod,
            BigDecimal totalGross,
            BigDecimal totalNet,
            BigDecimal totalStatutory,
            BigDecimal averageGross,
            int employeeCount,
            String currency
    ) {}

    public record LeaveSummary(
            int pendingRequests,
            int approvedThisMonth,
            int rejectedThisMonth,
            BigDecimal totalDaysTakenThisMonth
    ) {}

    public record AttendanceSummary(
            int clockInsToday,
            BigDecimal totalOvertimeThisMonth,
            int absentDaysThisMonth
    ) {}
}