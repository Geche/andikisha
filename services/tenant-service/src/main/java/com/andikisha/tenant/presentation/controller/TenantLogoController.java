package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.service.TenantLogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Tenant self-service company logo (for document branding). Scoped to the caller's own tenant
 * via TenantContext — no path/tenant id is accepted from the client (#57).
 */
@RestController
@RequestMapping("/api/v1/tenant/logo")
@Tag(name = "Tenant Logo", description = "Company logo for document branding")
public class TenantLogoController {

    private final TenantLogoService logoService;

    public TenantLogoController(TenantLogoService logoService) {
        this.logoService = logoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload/replace the company logo (PNG or JPEG, max 512 KB)")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        logoService.upload(file.getBytes(), file.getContentType());
        return Map.of("contentType", file.getContentType(), "size", file.getSize());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get the current tenant's company logo")
    public ResponseEntity<byte[]> get() {
        return logoService.getForCurrentTenant()
                .map(logo -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(logo.getContentType()))
                        .body(logo.getData()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
