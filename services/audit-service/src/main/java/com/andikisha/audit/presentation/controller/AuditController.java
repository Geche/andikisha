package com.andikisha.audit.presentation.controller;

import com.andikisha.audit.application.dto.response.AuditEntryResponse;
import com.andikisha.audit.application.dto.response.AuditSummaryResponse;
import com.andikisha.audit.application.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit", description = "Compliance audit trail")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "List all audit entries (most recent first)")
    public Page<AuditEntryResponse> listAll(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        return auditService.listAll(pageable);
    }

    @GetMapping("/domain/{domain}")
    @Operation(summary = "List audit entries by domain (EMPLOYEE, PAYROLL, LEAVE, etc.)")
    public Page<AuditEntryResponse> byDomain(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String domain,
            Pageable pageable) {
        return auditService.listByDomain(domain, pageable);
    }

    @GetMapping("/action/{action}")
    @Operation(summary = "List audit entries by action (CREATE, UPDATE, APPROVE, etc.)")
    public Page<AuditEntryResponse> byAction(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String action,
            Pageable pageable) {
        return auditService.listByAction(action, pageable);
    }

    @GetMapping("/resource/{resourceType}/{resourceId}")
    @Operation(summary = "List all audit entries for a specific resource")
    public Page<AuditEntryResponse> byResource(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String resourceType,
            @PathVariable String resourceId,
            Pageable pageable) {
        return auditService.listByResource(resourceType, resourceId, pageable);
    }

    @GetMapping("/actor/{actorId}")
    @Operation(summary = "List all actions taken by a specific user")
    public Page<AuditEntryResponse> byActor(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable String actorId,
            Pageable pageable) {
        return auditService.listByActor(actorId, pageable);
    }

    @GetMapping("/date-range")
    @Operation(summary = "List audit entries within a date range")
    public Page<AuditEntryResponse> byDateRange(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Pageable pageable) {
        return auditService.listByDateRange(from, to, pageable);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get audit activity summary with breakdown by domain and action")
    public AuditSummaryResponse summary(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return auditService.getSummary(from, to);
    }
}
