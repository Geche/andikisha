package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.request.SuperAdminLoginRequest;
import com.andikisha.auth.application.dto.request.SuperAdminProvisionRequest;
import com.andikisha.auth.application.dto.response.ImpersonationResponse;
import com.andikisha.auth.application.dto.response.SuperAdminProvisionResponse;
import com.andikisha.auth.application.dto.response.SuperAdminTokenResponse;
import com.andikisha.auth.application.service.SuperAdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Super Admin Auth", description = "SUPER_ADMIN provisioning, login, and impersonation")
public class SuperAdminAuthController {

    private final SuperAdminAuthService superAdminAuthService;

    public SuperAdminAuthController(SuperAdminAuthService superAdminAuthService) {
        this.superAdminAuthService = superAdminAuthService;
    }

    @PostMapping("/super-admin/provision")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Provision initial SUPER_ADMIN account — callable exactly once")
    public SuperAdminProvisionResponse provision(
            @Valid @RequestBody SuperAdminProvisionRequest request) {
        return superAdminAuthService.provision(request);
    }

    @PostMapping("/super-admin/login")
    @Operation(summary = "SUPER_ADMIN login — issues SYSTEM-scoped JWT")
    public SuperAdminTokenResponse login(@Valid @RequestBody SuperAdminLoginRequest request) {
        return superAdminAuthService.login(request);
    }

    @PostMapping("/tenants/{tenantId}/impersonate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Generate read-only impersonation token scoped to a tenant")
    public ImpersonationResponse impersonate(Authentication authentication,
                                             @PathVariable String tenantId) {
        return superAdminAuthService.impersonate(authentication.getName(), tenantId);
    }
}
