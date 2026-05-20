package com.andikisha.tenant.presentation.controller;

import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.dto.response.TenantSlugResponse;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/tenants")
public class PublicTenantController {

    private final TenantService tenantService;

    public PublicTenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
     * Resolves a workspace slug to a tenant ID. No authentication required.
     * Returns 404 if slug not found.
     * Returns 403 if tenant is CANCELLED or DELETED — avoids revealing the workspace
     * existed while preventing login.
     */
    @GetMapping("/resolve")
    public ResponseEntity<TenantSlugResponse> resolve(@RequestParam String slug) {
        Tenant tenant = tenantService.findByWorkspaceSlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", slug));

        if (tenant.getStatus() == TenantStatus.CANCELLED
                || tenant.getStatus() == TenantStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(new TenantSlugResponse(
                tenant.getTenantId(),
                tenant.getCompanyName(),
                tenant.getStatus().name()
        ));
    }
}
