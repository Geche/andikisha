package com.andikisha.analytics.presentation.controller;

import com.andikisha.analytics.application.dto.response.DashboardResponse;
import com.andikisha.analytics.application.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics", description = "Dashboard and reporting")
public class DashboardController {

    private final AnalyticsService analyticsService;

    public DashboardController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get HR dashboard summary")
    public DashboardResponse dashboard(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return analyticsService.getDashboard();
    }
}