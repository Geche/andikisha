package com.andikisha.payroll.e2e;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.application.service.PayrollService;
import com.andikisha.payroll.domain.exception.PayrollRunNotFoundException;
import com.andikisha.payroll.presentation.controller.PayrollController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PayrollController.class)
@Import(GlobalExceptionHandler.class)
class PayrollControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean PayrollService payrollService;

    // @EnableJpaAuditing on the application class requires jpaMappingContext,
    // which is not loaded by @WebMvcTest. Mock it to allow the context to start.
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT_ID = "e2e-tenant";
    private static final UUID   RUN_ID    = UUID.randomUUID();

    // -------------------------------------------------------------------------
    // POST /api/v1/payroll/runs — initiate
    // -------------------------------------------------------------------------

    @Test
    void initiate_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/payroll/runs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-ID", "hr-admin")
                        .content("""
                                {"period":"2024-01","payFrequency":"MONTHLY"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void initiate_withInvalidPeriodFormat_returns400WithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/payroll/runs")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", "hr-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"period":"January-2024","payFrequency":"MONTHLY"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void initiate_withBlankPeriod_returns400WithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/payroll/runs")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", "hr-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"period":"","payFrequency":"MONTHLY"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void initiate_happyPath_returns201() throws Exception {
        when(payrollService.initiatePayroll(any(), any())).thenReturn(minimalRunResponse("DRAFT"));

        mockMvc.perform(post("/api/v1/payroll/runs")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", "hr-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"period":"2024-01","payFrequency":"MONTHLY"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.period").value("2024-01"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/payroll/runs/{id}/calculate
    // -------------------------------------------------------------------------

    @Test
    void calculate_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/payroll/runs/{id}/calculate", RUN_ID))
                .andExpect(status().isBadRequest());
    }

    @Test
    void calculate_whenRunNotFound_returns404() throws Exception {
        when(payrollService.calculatePayroll(RUN_ID))
                .thenThrow(new PayrollRunNotFoundException(RUN_ID));

        mockMvc.perform(post("/api/v1/payroll/runs/{id}/calculate", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/payroll/runs/{id}/approve
    // -------------------------------------------------------------------------

    @Test
    void approve_whenRunNotFound_returns404() throws Exception {
        when(payrollService.approvePayroll(any(), any()))
                .thenThrow(new PayrollRunNotFoundException(RUN_ID));

        mockMvc.perform(post("/api/v1/payroll/runs/{id}/approve", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", "cfo-user"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void approve_whenBusinessRuleViolated_returns422() throws Exception {
        when(payrollService.approvePayroll(any(), any()))
                .thenThrow(new BusinessRuleException("WRONG_STATUS", "Can only approve a CALCULATED payroll"));

        mockMvc.perform(post("/api/v1/payroll/runs/{id}/approve", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", "cfo-user"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("WRONG_STATUS"));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/payroll/runs
    // -------------------------------------------------------------------------

    @Test
    void listRuns_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/payroll/runs"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listRuns_returnsPage() throws Exception {
        when(payrollService.listPayrollRuns(any()))
                .thenReturn(new PageImpl<>(
                        List.of(minimalRunResponse("DRAFT")),
                        PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/payroll/runs")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].period").value("2024-01"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/payroll/runs/{id}
    // -------------------------------------------------------------------------

    @Test
    void getRun_whenNotFound_returns404() throws Exception {
        when(payrollService.getPayrollRun(RUN_ID))
                .thenThrow(new PayrollRunNotFoundException(RUN_ID));

        mockMvc.perform(get("/api/v1/payroll/runs/{id}", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    // -------------------------------------------------------------------------
    // DELETE /api/v1/payroll/runs/{id} — cancel
    // -------------------------------------------------------------------------

    @Test
    void cancel_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/payroll/runs/{id}", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isNoContent());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private PayrollRunResponse minimalRunResponse(String status) {
        return new PayrollRunResponse(
                RUN_ID, "2024-01", "MONTHLY", status,
                0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, "KES", "hr-admin", null, null, null,
                LocalDateTime.now());
    }
}
