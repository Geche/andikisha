package com.andikisha.compliance.presentation.controller;

import com.andikisha.compliance.application.dto.response.ComplianceSummaryResponse;
import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/v1/compliance")
@Tag(name = "Compliance", description = "Statutory rates and tax rules")
public class ComplianceController {

    private final ComplianceService complianceService;

    public ComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @GetMapping("/{country}/summary")
    @Operation(summary = "Get full compliance summary for a country")
    public ComplianceSummaryResponse getSummary(
            @PathVariable String country,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveDate) {
        return complianceService.getComplianceSummary(country, effectiveDate);
    }

    @GetMapping("/{country}/tax-brackets")
    @Operation(summary = "Get current PAYE tax brackets")
    public List<TaxBracketResponse> getTaxBrackets(@PathVariable String country) {
        return complianceService.getTaxBrackets(country);
    }

    @GetMapping("/{country}/statutory-rates")
    @Operation(summary = "Get current statutory deduction rates")
    public List<StatutoryRateResponse> getStatutoryRates(@PathVariable String country) {
        return complianceService.getStatutoryRates(country);
    }
}