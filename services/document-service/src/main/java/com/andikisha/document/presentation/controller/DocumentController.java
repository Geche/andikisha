package com.andikisha.document.presentation.controller;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.application.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "Documents", description = "Document generation and retrieval")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @Operation(summary = "List all documents")
    public Page<DocumentResponse> listAll(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        return documentService.listAll(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document metadata")
    public DocumentResponse getById(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return documentService.getById(id);
    }

    @GetMapping("/{id}/download")
    // Method-level grant overrides the class-level admin-tier restriction: EMPLOYEE and
    // LINE_MANAGER may reach this endpoint, but DocumentService.download enforces OWN-scope
    // + a self-service type allowlist (payslip / P9). Tenant-wide listing stays admin-only.
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER', 'LINE_MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Download a document file")
    public ResponseEntity<byte[]> download(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @PathVariable UUID id) {
        DocumentService.DownloadResult result = documentService.download(id, role, employeeId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .contentLength(result.content().length)
                .body(result.content());
    }

    @GetMapping("/my")
    // Self-service: any authenticated user with an employee record lists their OWN documents,
    // restricted to self-service types (payslip / P9) by the service. employeeId comes from the
    // gateway-supplied X-Employee-ID header — never a path variable — so there is no IDOR
    // surface. Lets the portal resolve a downloadable documentId (B-5 D4 follow-on).
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER', 'LINE_MANAGER', 'EMPLOYEE')")
    @Operation(summary = "List my own self-service documents (payslips, P9 forms)")
    public List<DocumentResponse> myDocuments(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            throw new BusinessRuleException("NO_EMPLOYEE_CONTEXT",
                    "Your account is not linked to an employee record");
        }
        return documentService.getMySelfServiceDocuments(UUID.fromString(employeeId));
    }

    @GetMapping("/employees/{employeeId}")
    @Operation(summary = "Get documents for an employee")
    public Page<DocumentResponse> forEmployee(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID employeeId,
            Pageable pageable) {
        return documentService.getForEmployee(employeeId, pageable);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get documents by type")
    public Page<DocumentResponse> byType(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String type,
            Pageable pageable) {
        return documentService.getByType(type, pageable);
    }

    @GetMapping("/payroll-runs/{payrollRunId}")
    @Operation(summary = "Get payslips for a payroll run")
    public List<DocumentResponse> forPayrollRun(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID payrollRunId) {
        return documentService.getForPayrollRun(payrollRunId);
    }
}
