package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.dto.request.ChangePlanRequest;
import com.andikisha.tenant.application.dto.request.CreateTenantRequest;
import com.andikisha.tenant.application.dto.request.SuspendTenantRequest;
import com.andikisha.tenant.application.dto.request.UpdateTenantRequest;
import com.andikisha.tenant.application.dto.response.TenantResponse;
import com.andikisha.tenant.application.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@Tag(name = "Tenants", description = "Tenant registration and management")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new tenant (company)")
    public TenantResponse create(@Valid @RequestBody CreateTenantRequest request) {
        return tenantService.create(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tenant by ID")
    public TenantResponse getById(@PathVariable UUID id) {
        return tenantService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Operation(summary = "List all tenants (platform admin only)")
    public Page<TenantResponse> listAll(Pageable pageable) {
        return tenantService.listAll(pageable);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update tenant details")
    public TenantResponse update(@PathVariable UUID id,
                                 @Valid @RequestBody UpdateTenantRequest request) {
        return tenantService.update(id, request);
    }

    @PostMapping("/{id}/suspend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Suspend a tenant")
    public void suspend(@PathVariable UUID id,
                        @Valid @RequestBody SuspendTenantRequest request) {
        tenantService.suspend(id, request.reason());
    }

    @PostMapping("/{id}/reactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reactivate a suspended tenant")
    public void reactivate(@PathVariable UUID id) {
        tenantService.reactivate(id);
    }

    @PostMapping("/{id}/change-plan")
    @Operation(summary = "Change tenant subscription plan")
    public TenantResponse changePlan(@PathVariable UUID id,
                                     @Valid @RequestBody ChangePlanRequest request) {
        return tenantService.changePlan(id, request.planName());
    }
}