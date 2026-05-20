package com.andikisha.tenant.presentation.controller;

import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.dto.response.WorkspaceResolveResponse;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/workspaces")
public class PublicTenantController {

    private final TenantService tenantService;

    public PublicTenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
     * Resolves a workspace identifier to a tenant ID. No authentication required.
     * Called by the tenant-portal BFF before the login request.
     *
     * 404 — workspace does not exist.
     * 403 — tenant is CANCELLED or DELETED (avoids confirming the workspace existed).
     */
    @GetMapping("/{workspace}/resolve")
    public ResponseEntity<WorkspaceResolveResponse> resolve(@PathVariable String workspace) {
        Tenant tenant = tenantService.findByWorkspace(workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspace));

        if (tenant.getStatus() == TenantStatus.CANCELLED
                || tenant.getStatus() == TenantStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(new WorkspaceResolveResponse(
                tenant.getTenantId(),
                tenant.getCompanyName(),
                tenant.getStatus().name()
        ));
    }
}
