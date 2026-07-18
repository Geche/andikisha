package com.andikisha.recruitment.presentation.controller;

import com.andikisha.recruitment.application.dto.request.CreatePipelineTemplateRequest;
import com.andikisha.recruitment.application.dto.request.UpdatePipelineTemplateRequest;
import com.andikisha.recruitment.application.dto.response.PipelineTemplateResponse;
import com.andikisha.recruitment.application.service.PipelineTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Pipeline template configuration. Every path is under {@code /api/v1/recruitment/...} — the only
 * prefix the gateway routes and the BFF allowlist permits. PAYROLL_OFFICER is excluded from all
 * recruitment endpoints by design.
 */
@RestController
@RequestMapping("/api/v1/recruitment/pipeline-templates")
@Tag(name = "Pipeline Templates", description = "Tenant-customisable hiring pipelines")
public class PipelineTemplateController {

    private final PipelineTemplateService templateService;

    public PipelineTemplateController(PipelineTemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List pipeline templates (seeds the tenant default on first access)")
    public List<PipelineTemplateResponse> list(@RequestHeader("X-Tenant-ID") String tenantId) {
        return templateService.listTemplates();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a pipeline template")
    public PipelineTemplateResponse create(@RequestHeader("X-Tenant-ID") String tenantId,
                                           @Valid @RequestBody CreatePipelineTemplateRequest request) {
        return templateService.createTemplate(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update a pipeline template (anchors protected, stage ids preserved)")
    public PipelineTemplateResponse update(@RequestHeader("X-Tenant-ID") String tenantId,
                                           @PathVariable UUID id,
                                           @Valid @RequestBody UpdatePipelineTemplateRequest request) {
        return templateService.updateTemplate(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Deactivate a pipeline template (rejected if referenced by a posting)")
    public void deactivate(@RequestHeader("X-Tenant-ID") String tenantId, @PathVariable UUID id) {
        templateService.deactivateTemplate(id);
    }
}
