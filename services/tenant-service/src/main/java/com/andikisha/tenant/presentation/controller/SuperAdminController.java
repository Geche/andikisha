package com.andikisha.tenant.presentation.controller;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.tenant.application.dto.request.CreateTenantWithLicenceRequest;
import com.andikisha.tenant.application.dto.request.RenewLicenceRequest;
import com.andikisha.tenant.application.dto.request.SuspendTenantRequest;
import com.andikisha.tenant.application.dto.request.UpgradeLicenceRequest;
import com.andikisha.tenant.application.dto.response.ExpiringLicenceResponse;
import com.andikisha.tenant.application.dto.response.LicenceHistoryResponse;
import com.andikisha.tenant.application.dto.response.LicenceResponse;
import com.andikisha.tenant.application.dto.response.ProvisionedTenantResponse;
import com.andikisha.tenant.application.dto.response.SuperAdminAnalyticsResponse;
import com.andikisha.tenant.application.dto.response.TenantDetailResponse;
import com.andikisha.tenant.application.dto.response.TenantSummaryResponse;
import com.andikisha.tenant.application.service.LicencePlanService;
import com.andikisha.tenant.application.service.LicenceStateMachineService;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.application.service.SuperAdminTenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * SUPER_ADMIN-only platform administration endpoints.
 *
 * Authorization is enforced at the class level via {@code @PreAuthorize}.
 * Per the architecture, controllers MUST NOT contain business logic — every
 * method here delegates to an application service.
 */
@RestController
@RequestMapping("/api/v1/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin", description = "Platform-wide tenant and licence management")
public class SuperAdminController {

    private static final int MAX_DAYS_AHEAD = 90;

    private final SuperAdminTenantService superAdminTenantService;
    private final LicencePlanService licencePlanService;
    private final LicenceStateMachineService stateMachine;

    public SuperAdminController(SuperAdminTenantService superAdminTenantService,
                                LicencePlanService licencePlanService,
                                LicenceStateMachineService stateMachine) {
        this.superAdminTenantService = superAdminTenantService;
        this.licencePlanService = licencePlanService;
        this.stateMachine = stateMachine;
    }

    @PostMapping("/tenants")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Provision a new tenant with an initial licence")
    public ProvisionedTenantResponse createTenant(
            @Valid @RequestBody CreateTenantWithLicenceRequest request) {
        return superAdminTenantService.createTenantWithLicence(request, currentUserId());
    }

    @GetMapping("/tenants")
    @Operation(summary = "List all tenants (platform-wide)")
    public Page<TenantSummaryResponse> listTenants(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID planId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        // Filtering by status / planId / search is delegated to the service
        // when implemented; today the simple list call covers the read use case.
        return superAdminTenantService.listTenants(pageable);
    }

    @GetMapping("/tenants/{tenantId}")
    @Operation(summary = "Get full tenant detail including current licence")
    public TenantDetailResponse getTenantDetail(@PathVariable UUID tenantId) {
        return superAdminTenantService.getTenantDetail(tenantId);
    }

    @PatchMapping("/tenants/{tenantId}/suspend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Suspend a tenant (licence -> SUSPENDED)")
    public void suspendTenant(@PathVariable UUID tenantId,
                              @Valid @RequestBody SuspendTenantRequest request) {
        stateMachine.suspend(tenantId.toString(), request.reason(), currentUserId());
    }

    @PatchMapping("/tenants/{tenantId}/reactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reactivate a suspended tenant (licence -> ACTIVE)")
    public void reactivateTenant(@PathVariable UUID tenantId) {
        stateMachine.reactivate(tenantId.toString(), currentUserId());
    }

    @PostMapping("/tenants/{tenantId}/licences/renew")
    @Operation(summary = "Renew a tenant's licence")
    public LicenceResponse renewLicence(@PathVariable UUID tenantId,
                                        @Valid @RequestBody RenewLicenceRequest request) {
        var renewed = licencePlanService.renew(
                tenantId.toString(),
                request.planId(),
                request.billingCycle(),
                request.seatCount(),
                request.agreedPriceKes(),
                request.newEndDate(),
                currentUserId());
        return licencePlanService.toResponse(renewed);
    }

    @PostMapping("/tenants/{tenantId}/licences/upgrade")
    @Operation(summary = "Upgrade a tenant's plan (or change seats/price)")
    public LicenceResponse upgradeLicence(@PathVariable UUID tenantId,
                                          @Valid @RequestBody UpgradeLicenceRequest request) {
        var upgraded = licencePlanService.upgrade(
                tenantId.toString(),
                request.newPlanId(),
                request.seatCount(),
                request.agreedPriceKes(),
                currentUserId());
        return licencePlanService.toResponse(upgraded);
    }

    @GetMapping("/tenants/{tenantId}/licences/history")
    @Operation(summary = "Read licence-status transition history for a tenant")
    public List<LicenceHistoryResponse> getLicenceHistory(@PathVariable UUID tenantId) {
        return licencePlanService.getHistoryForTenant(tenantId.toString());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Platform-wide subscription analytics (MRR, ARR, plan mix)")
    public SuperAdminAnalyticsResponse getAnalytics() {
        return licencePlanService.getSuperAdminAnalytics();
    }

    @GetMapping("/licences/expiring")
    @Operation(summary = "Licences expiring within N days (default 30, max 90)")
    public ResponseEntity<List<ExpiringLicenceResponse>> getExpiringLicences(
            @RequestParam(defaultValue = "30") int daysAhead) {
        if (daysAhead <= 0 || daysAhead > MAX_DAYS_AHEAD) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(licencePlanService.getExpiringLicences(daysAhead));
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("No authenticated principal");
        }
        return auth.getPrincipal().toString();
    }
}
