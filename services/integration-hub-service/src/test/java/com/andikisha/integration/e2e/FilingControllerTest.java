package com.andikisha.integration.e2e;

import com.andikisha.integration.application.dto.response.FilingRecordResponse;
import com.andikisha.integration.application.service.FilingService;
import com.andikisha.integration.presentation.controller.FilingController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FilingController.class)
class FilingControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean FilingService filingService;

    private static final String TENANT_ID = "tenant-e2e-test";

    @Test
    void createPayeFiling_happyPath_returns201() throws Exception {
        when(filingService.createPayeFiling(eq("2024-01"), eq(10), any()))
                .thenReturn(buildResponse("KRA_ITAX", "2024-01"));

        mockMvc.perform(post("/api/v1/filings/paye")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "period", "2024-01",
                                "employeeCount", 10,
                                "totalPaye", "150000.00"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filingType").value("KRA_ITAX"))
                .andExpect(jsonPath("$.period").value("2024-01"));
    }

    @Test
    void createPayeFiling_missingPeriod_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/filings/paye")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "employeeCount", 10,
                                "totalPaye", "150000.00"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createPayeFiling_negativeEmployeeCount_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/filings/paye")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "period", "2024-01",
                                "employeeCount", -1,
                                "totalPaye", "150000.00"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createNssfFiling_happyPath_returns201() throws Exception {
        when(filingService.createNssfFiling(any(), any(int.class), any(), any()))
                .thenReturn(buildResponse("NSSF_REMITTANCE", "2024-01"));

        mockMvc.perform(post("/api/v1/filings/nssf")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "period", "2024-01",
                                "employeeCount", 10,
                                "employeeTotal", "21600.00",
                                "employerTotal", "21600.00"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filingType").value("NSSF_REMITTANCE"));
    }

    @Test
    void createShifFiling_happyPath_returns201() throws Exception {
        when(filingService.createShifFiling(any(), any(int.class), any()))
                .thenReturn(buildResponse("SHIF_REMITTANCE", "2024-01"));

        mockMvc.perform(post("/api/v1/filings/shif")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "period", "2024-01",
                                "employeeCount", 10,
                                "totalShif", "27500.00"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filingType").value("SHIF_REMITTANCE"));
    }

    @Test
    void getFiling_happyPath_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        when(filingService.getFiling(id)).thenReturn(buildResponse("KRA_ITAX", "2024-01"));

        mockMvc.perform(get("/api/v1/filings/{id}", id)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filingType").value("KRA_ITAX"));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private FilingRecordResponse buildResponse(String type, String period) {
        return new FilingRecordResponse(
                UUID.randomUUID(), type, period, "PENDING",
                10, new BigDecimal("150000"), BigDecimal.ZERO,
                null, null, null, null, null);
    }
}
