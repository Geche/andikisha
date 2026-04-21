package com.andikisha.integration.presentation.controller;

import com.andikisha.integration.application.dto.request.CreateNssfFilingRequest;
import com.andikisha.integration.application.dto.request.CreatePayeFilingRequest;
import com.andikisha.integration.application.dto.request.CreateShifFilingRequest;
import com.andikisha.integration.application.dto.response.FilingRecordResponse;
import com.andikisha.integration.application.service.FilingService;
import com.andikisha.integration.domain.model.IntegrationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/filings")
@Tag(name = "Statutory Filings", description = "KRA, NSSF, SHIF statutory submissions")
public class FilingController {

    private final FilingService filingService;

    public FilingController(FilingService filingService) {
        this.filingService = filingService;
    }

    @PostMapping("/paye")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create PAYE filing for KRA iTax")
    public FilingRecordResponse createPayeFiling(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @Valid @RequestBody CreatePayeFilingRequest request) {
        return filingService.createPayeFiling(
                request.period(), request.employeeCount(), request.totalPaye());
    }

    @PostMapping("/nssf")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create NSSF remittance filing")
    public FilingRecordResponse createNssfFiling(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @Valid @RequestBody CreateNssfFilingRequest request) {
        return filingService.createNssfFiling(
                request.period(), request.employeeCount(),
                request.employeeTotal(), request.employerTotal());
    }

    @PostMapping("/shif")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create SHIF remittance filing")
    public FilingRecordResponse createShifFiling(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @Valid @RequestBody CreateShifFilingRequest request) {
        return filingService.createShifFiling(
                request.period(), request.employeeCount(), request.totalShif());
    }

    @GetMapping
    @Operation(summary = "List all filings")
    public Page<FilingRecordResponse> list(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        return filingService.listFilings(pageable);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "List filings by type")
    public Page<FilingRecordResponse> listByType(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable IntegrationType type,
            Pageable pageable) {
        return filingService.listByType(type, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get filing details")
    public FilingRecordResponse getFiling(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return filingService.getFiling(id);
    }
}
