package com.andikisha.analytics.presentation.controller;

import com.andikisha.analytics.application.dto.response.HeadcountSnapshotResponse;
import com.andikisha.analytics.application.dto.response.LeaveAnalyticsResponse;
import com.andikisha.analytics.application.dto.response.PayrollSummaryResponse;
import com.andikisha.analytics.application.mapper.AnalyticsMapper;
import com.andikisha.analytics.application.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final AnalyticsMapper analyticsMapper;

    public ReportsController(AnalyticsService analyticsService, AnalyticsMapper analyticsMapper) {
        this.analyticsService = analyticsService;
        this.analyticsMapper = analyticsMapper;
    }

    @GetMapping("/payroll-trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get payroll cost trend over a period range")
    public List<PayrollSummaryResponse> payrollTrend(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam String fromPeriod,
            @RequestParam String toPeriod) {
        return analyticsMapper.toPayrollSummaryList(analyticsService.getPayrollTrend(fromPeriod, toPeriod));
    }

    @GetMapping("/headcount-trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get headcount trend over a date range")
    public List<HeadcountSnapshotResponse> headcountTrend(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsMapper.toHeadcountList(analyticsService.getHeadcountTrend(from, to));
    }

    @GetMapping("/leave-breakdown/{period}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get leave breakdown by type for a period")
    public List<LeaveAnalyticsResponse> leaveBreakdown(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String period) {
        return analyticsMapper.toLeaveList(analyticsService.getLeaveBreakdown(period));
    }

    @GetMapping("/leave-trend/{leaveType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get leave trend over time for a specific leave type")
    public List<LeaveAnalyticsResponse> leaveTrend(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String leaveType) {
        return analyticsMapper.toLeaveList(analyticsService.getLeaveTrend(leaveType));
    }
}
