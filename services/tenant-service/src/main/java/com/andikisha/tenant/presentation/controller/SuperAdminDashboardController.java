package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.dto.response.DashboardMetricsResponse;
import com.andikisha.tenant.application.dto.response.TenantGrowthPointResponse;
import com.andikisha.tenant.application.service.SuperAdminTenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Aggregation endpoints powering the SUPER_ADMIN dashboard UI.
 * <p>
 * Mounted under {@code /api/v1/superadmin} (no hyphen) to match the cross-service
 * superadmin path convention shared with auth-service. Note: the existing
 * {@link SuperAdminController} in this service uses {@code /api/v1/super-admin}
 * (with hyphen); these two prefixes coexist intentionally for now and should be
 * reconciled in a follow-up cleanup.
 */
@RestController
@RequestMapping("/api/v1/superadmin/dashboard")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin Dashboard", description = "Platform-wide KPI aggregations")
public class SuperAdminDashboardController {

    private final SuperAdminTenantService superAdminTenantService;

    public SuperAdminDashboardController(SuperAdminTenantService superAdminTenantService) {
        this.superAdminTenantService = superAdminTenantService;
    }

    @GetMapping("/metrics")
    @Operation(summary = "KPI counts for the SUPER_ADMIN dashboard")
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        return ResponseEntity.ok(superAdminTenantService.getDashboardMetrics());
    }

    @GetMapping("/growth")
    @Operation(summary = "Tenant signup and active counts grouped by month for the requested period")
    public ResponseEntity<List<TenantGrowthPointResponse>> getGrowth(
            @RequestParam(defaultValue = "12m") String period) {
        return ResponseEntity.ok(superAdminTenantService.getTenantGrowth(period));
    }
}
