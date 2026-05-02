package com.andikisha.integration.e2e;

import com.andikisha.integration.application.dto.response.PaymentSummaryResponse;
import com.andikisha.integration.application.dto.response.PaymentTransactionResponse;
import com.andikisha.integration.application.service.PaymentService;
import com.andikisha.integration.infrastructure.config.SecurityConfig;
import com.andikisha.integration.presentation.controller.PaymentController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@Import({SecurityConfig.class, WebMvcTestSecurityConfig.class})
class PaymentControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean PaymentService paymentService;

    private static final String TENANT_ID  = "tenant-e2e-test";
    private static final UUID   RUN_ID     = UUID.randomUUID();

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void disburse_returns202Accepted() throws Exception {
        mockMvc.perform(post("/api/v1/payments/payroll-runs/{id}/disburse", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isAccepted());

        verify(paymentService).processBatchPayments(TENANT_ID, RUN_ID);
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void retryFailed_returns202Accepted() throws Exception {
        mockMvc.perform(post("/api/v1/payments/payroll-runs/{id}/retry-failed", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isAccepted());

        verify(paymentService).retryFailed(TENANT_ID, RUN_ID);
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void forPayrollRun_returns200WithTransactions() throws Exception {
        when(paymentService.getForPayrollRun(RUN_ID))
                .thenReturn(List.of(buildTransactionResponse()));

        mockMvc.perform(get("/api/v1/payments/payroll-runs/{id}", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].paymentMethod").value("MPESA"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void summary_returns200WithCounts() throws Exception {
        when(paymentService.getPayrollPaymentSummary(RUN_ID))
                .thenReturn(new PaymentSummaryResponse(
                        10L, 8L, 1L, 1L, 7L, 1L,
                        new BigDecimal("500000"), new BigDecimal("400000")));

        mockMvc.perform(get("/api/v1/payments/payroll-runs/{id}/summary", RUN_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTransactions").value(10))
                .andExpect(jsonPath("$.completed").value(8))
                .andExpect(jsonPath("$.failed").value(1));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void list_returns200PagedTransactions() throws Exception {
        when(paymentService.listTransactions(any()))
                .thenReturn(new PageImpl<>(List.of(buildTransactionResponse())));

        mockMvc.perform(get("/api/v1/payments")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void disburse_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/payments/payroll-runs/{id}/disburse", RUN_ID))
                .andExpect(status().isBadRequest());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private PaymentTransactionResponse buildTransactionResponse() {
        return new PaymentTransactionResponse(
                UUID.randomUUID(), RUN_ID, UUID.randomUUID(),
                UUID.randomUUID(), "Test Employee",
                "MPESA", "+254700000001",
                new BigDecimal("50000"), "KES", "COMPLETED",
                "PAY-REF-001", "QGH7YK3BXY",
                null, Instant.now(), Instant.now(), 0);
    }
}
