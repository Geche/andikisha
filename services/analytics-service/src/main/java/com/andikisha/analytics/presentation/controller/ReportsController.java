package com.andikisha.analytics.presentation.controller;

import com.andikisha.analytics.application.service.AnalyticsService;
import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.model.PayrollSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics/reports")
@Tag(name = "Reports", description = "Trend reports and data exports")
public class ReportsController {

    private final AnalyticsService analyticsService;

    public ReportsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/payroll-trend")
    @Operation(summary = "Get payroll cost trend over a period range")
    public List<PayrollSummary> payrollTrend(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam String fromPeriod,
            @RequestParam String toPeriod) {
        return analyticsService.getPayrollTrend(fromPeriod, toPeriod);
    }

    @GetMapping("/headcount-trend")
    @Operation(summary = "Get headcount trend over a date range")
    public List<HeadcountSnapshot> headcountTrend(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getHeadcountTrend(from, to);
    }

    @GetMapping("/leave-breakdown/{period}")
    @Operation(summary = "Get leave breakdown by type for a period")
    public List<LeaveAnalytics> leaveBreakdown(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String period) {
        return analyticsService.getLeaveBreakdown(period);
    }

    @GetMapping("/leave-trend/{leaveType}")
    @Operation(summary = "Get leave trend over time for a specific leave type")
    public List<LeaveAnalytics> leaveTrend(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String leaveType) {
        return analyticsService.getLeaveTrend(leaveType);
    }
}