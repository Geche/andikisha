package com.andikisha.compliance.presentation.controller;

import com.andikisha.compliance.application.dto.response.ComplianceSummaryResponse;
import com.andikisha.compliance.application.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/**
 * Public, unauthenticated statutory rate data — the single source of truth for
 * the marketing payroll calculator and any future quote/lookup tools. Returns
 * rate DATA (PAYE bands, NSSF/SHIF/Housing rates, reliefs), not a computed
 * payslip, so callers run their own scenarios. Aggressively cacheable — these
 * change only when a Finance Bill ships.
 */
@RestController
@RequestMapping("/api/v1/public/compliance")
@Tag(name = "Public Compliance", description = "Unauthenticated statutory rate data")
public class PublicComplianceController {

    private final ComplianceService complianceService;

    public PublicComplianceController(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @GetMapping("/{country}/rates")
    @Operation(summary = "Public statutory rates (PAYE bands, NSSF, SHIF, Housing Levy, reliefs)")
    public ResponseEntity<ComplianceSummaryResponse> getRates(@PathVariable String country) {
        ComplianceSummaryResponse summary = complianceService.getComplianceSummary(country, null);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofHours(6)).cachePublic())
                .body(summary);
    }
}
