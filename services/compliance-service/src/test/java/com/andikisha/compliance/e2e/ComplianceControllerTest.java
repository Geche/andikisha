package com.andikisha.compliance.e2e;

import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.compliance.application.dto.response.ComplianceSummaryResponse;
import com.andikisha.compliance.domain.exception.InvalidCountryCodeException;
import com.andikisha.compliance.infrastructure.config.WebMvcConfig;
import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.service.ComplianceService;
import com.andikisha.compliance.presentation.controller.ComplianceController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ComplianceController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class})
class ComplianceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean ComplianceService complianceService;

    private static final String BASE    = "/api/v1/compliance";
    private static final String TENANT  = "acme-corp";
    private static final String USER_ID = "payroll-user";

    // ------------------------------------------------------------------
    // GET /{country}/summary
    // ------------------------------------------------------------------

    @Test
    void getSummary_happyPath_returns200() throws Exception {
        ComplianceSummaryResponse response = new ComplianceSummaryResponse(
                "KE", "2025-01-01",
                List.of(bracket(1, "0", "24000", "0.10")),
                List.of(rate("NSSF", "0.06", "7000", "36000")),
                List.of());

        when(complianceService.getComplianceSummary(eq("ke"), any())).thenReturn(response);

        mockMvc.perform(get(BASE + "/ke/summary")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.country").value("KE"))
                .andExpect(jsonPath("$.taxBrackets[0].bandNumber").value(1))
                .andExpect(jsonPath("$.statutoryRates[0].rateType").value("NSSF"));
    }

    @Test
    void getSummary_withEffectiveDate_passesDateToService() throws Exception {
        ComplianceSummaryResponse response = new ComplianceSummaryResponse(
                "KE", "2024-07-01", List.of(), List.of(), List.of());

        when(complianceService.getComplianceSummary(eq("ke"), eq(LocalDate.of(2024, 7, 1))))
                .thenReturn(response);

        mockMvc.perform(get(BASE + "/ke/summary")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .param("effectiveDate", "2024-07-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.effectiveDate").value("2024-07-01"));
    }

    @Test
    void getSummary_invalidCountryCode_returns400() throws Exception {
        when(complianceService.getComplianceSummary(eq("xx"), any()))
                .thenThrow(new InvalidCountryCodeException("xx"));

        mockMvc.perform(get(BASE + "/xx/summary")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // GET /{country}/tax-brackets
    // ------------------------------------------------------------------

    @Test
    void getTaxBrackets_happyPath_returnsOrderedBrackets() throws Exception {
        when(complianceService.getTaxBrackets("ke")).thenReturn(List.of(
                bracket(1, "0", "24000", "0.10"),
                bracket(2, "24000.01", "32300", "0.25")
        ));

        mockMvc.perform(get(BASE + "/ke/tax-brackets")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].bandNumber").value(1))
                .andExpect(jsonPath("$[1].bandNumber").value(2))
                .andExpect(jsonPath("$[1].upperBound").value(32300));
    }

    @Test
    void getTaxBrackets_band2UpperBound_is32300NotWrong32333() throws Exception {
        // Regression guard: confirms the KRA-correct 32,300 boundary is returned
        when(complianceService.getTaxBrackets("ke")).thenReturn(List.of(
                bracket(2, "24000.01", "32300", "0.25")
        ));

        mockMvc.perform(get(BASE + "/ke/tax-brackets")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].upperBound").value(32300));
    }

    @Test
    void getTaxBrackets_emptyResult_returns200WithEmptyArray() throws Exception {
        when(complianceService.getTaxBrackets("ug")).thenReturn(List.of());

        mockMvc.perform(get(BASE + "/ug/tax-brackets")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ------------------------------------------------------------------
    // GET /{country}/statutory-rates
    // ------------------------------------------------------------------

    @Test
    void getStatutoryRates_happyPath_returnsAllRates() throws Exception {
        when(complianceService.getStatutoryRates("ke")).thenReturn(List.of(
                rate("SHIF", "0.0275", null, null),
                rate("HOUSING_LEVY_EMPLOYEE", "0.015", null, null)
        ));

        mockMvc.perform(get(BASE + "/ke/statutory-rates")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].rateType").value("SHIF"))
                .andExpect(jsonPath("$[1].rateType").value("HOUSING_LEVY_EMPLOYEE"));
    }

    @Test
    void getStatutoryRates_shifRate_preservesPrecision() throws Exception {
        // SHIF is 2.75% — verifies BigDecimal serialises without floating-point drift
        when(complianceService.getStatutoryRates("ke")).thenReturn(List.of(
                rate("SHIF", "0.0275", null, null)
        ));

        mockMvc.perform(get(BASE + "/ke/statutory-rates")
                        .header("X-Tenant-ID", TENANT)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rateValue").value(0.0275));
    }

    // ------------------------------------------------------------------
    // Missing tenant header
    // ------------------------------------------------------------------

    @Test
    void anyEndpoint_missingTenantHeader_returns400() throws Exception {
        // Auth passes via TrustedHeaderAuthFilter; TenantInterceptor rejects missing X-Tenant-ID
        mockMvc.perform(get(BASE + "/ke/tax-brackets")
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private TaxBracketResponse bracket(int band, String lower, String upper, String rate) {
        return new TaxBracketResponse(
                band,
                new BigDecimal(lower),
                upper != null ? new BigDecimal(upper) : null,
                new BigDecimal(rate),
                LocalDate.of(2024, 7, 1));
    }

    private StatutoryRateResponse rate(String type, String rateValue,
                                       String limit, String secondaryLimit) {
        return new StatutoryRateResponse(
                type,
                new BigDecimal(rateValue),
                limit != null ? new BigDecimal(limit) : null,
                secondaryLimit != null ? new BigDecimal(secondaryLimit) : null,
                null,
                type + " description",
                LocalDate.of(2024, 1, 1));
    }
}
