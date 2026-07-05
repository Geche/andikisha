package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.service.TenantSignatoryService;
import com.andikisha.tenant.domain.model.TenantSignatory;
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
 * Tenant self-service authorized signatory (for issued documents). Scoped to the caller's own
 * tenant via TenantContext — no tenant id accepted from the client (#58).
 */
@RestController
@RequestMapping("/api/v1/tenant/signatory")
@Tag(name = "Tenant Signatory", description = "Authorized signatory for issued documents")
public class TenantSignatoryController {

    private final TenantSignatoryService signatoryService;

    public TenantSignatoryController(TenantSignatoryService signatoryService) {
        this.signatoryService = signatoryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Set the authorized signatory (name, title, signature image PNG/JPEG max 512 KB)")
    public Map<String, Object> upload(
            @RequestParam("name") String name,
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) throws IOException {
        signatoryService.upload(name, title, file.getBytes(), file.getContentType());
        return Map.of("name", name, "title", title, "signatureContentType", file.getContentType());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get the current tenant's authorized signatory metadata")
    public ResponseEntity<Map<String, Object>> get() {
        return signatoryService.getForCurrentTenant()
                .<ResponseEntity<Map<String, Object>>>map(s -> ResponseEntity.ok(Map.of(
                        "name", s.getName(),
                        "title", s.getTitle(),
                        "signatureContentType", s.getSignatureContentType())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get the current tenant's signature image")
    public ResponseEntity<byte[]> image() {
        return signatoryService.getForCurrentTenant()
                .map(s -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(s.getSignatureContentType()))
                        .body(s.getSignatureData()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
