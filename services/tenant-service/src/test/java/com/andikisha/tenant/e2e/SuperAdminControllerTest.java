package com.andikisha.tenant.e2e;

import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.dto.response.TenantSummaryResponse;
import com.andikisha.tenant.application.service.FeatureFlagService;
import com.andikisha.tenant.application.service.LicencePlanService;
import com.andikisha.tenant.application.service.LicenceStateMachineService;
import com.andikisha.tenant.application.service.SuperAdminTenantService;
import com.andikisha.common.exception.BusinessRuleException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(com.andikisha.tenant.presentation.controller.SuperAdminController.class)
@Import({
        com.andikisha.tenant.infrastructure.config.SecurityConfig.class,
        com.andikisha.tenant.presentation.filter.TrustedHeaderAuthFilter.class,
        com.andikisha.common.exception.GlobalExceptionHandler.class,
        com.andikisha.tenant.presentation.advice.TenantExceptionHandler.class
})
class SuperAdminControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;
    @MockitoBean SuperAdminTenantService superAdminTenantService;
    @MockitoBean LicencePlanService licencePlanService;
    @MockitoBean LicenceStateMachineService licenceStateMachineService;
    @MockitoBean FeatureFlagService featureFlagService;

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final String SA = "SUPER_ADMIN";

    // ── statutory KRA PIN validation (TENANT-BACKLOG-004) ───────────────────────

    @Test
    void updateStatutory_malformedKraPin_returns400() throws Exception {
        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/statutory", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kraPin\":\"NOTAPIN\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateStatutory_validKraPin_returns204() throws Exception {
        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/statutory", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kraPin\":\"A123456789X\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void updateStatutory_emptyKraPin_isAllowed_returns204() throws Exception {
        // Optional field: empty clears it, so it must not be rejected.
        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/statutory", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kraPin\":\"\"}"))
                .andExpect(status().isNoContent());
    }

    // ── extend-trial ──────────────────────────────────────────────────────────

    @Test
    void extendTrial_missingBody_returns400() throws Exception {
        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/extend-trial", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void extendTrial_happyPath_returns200() throws Exception {
        TenantSummaryResponse summary = new TenantSummaryResponse(
                TENANT_ID, "Acme Corp", "acme", "TRIAL", "Starter",
                10, LocalDate.of(2026, 6, 30), "admin@acme.com", LocalDateTime.now());
        when(superAdminTenantService.extendTrial(eq(TENANT_ID), eq(14), any()))
                .thenReturn(summary);

        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/extend-trial", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"additionalDays\":14}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organisationName").value("Acme Corp"));
    }

    @Test
    void extendTrial_nonTrialTenant_returns422() throws Exception {
        when(superAdminTenantService.extendTrial(eq(TENANT_ID), anyInt(), any()))
                .thenThrow(new BusinessRuleException("INVALID_STATE",
                        "Can only extend trial for tenants in TRIAL status"));

        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/extend-trial", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"additionalDays\":14}"))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── cancel (soft-delete) ──────────────────────────────────────────────────

    @Test
    void cancelTenant_happyPath_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/super-admin/tenants/{id}", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isNoContent());
    }

    @Test
    void cancelTenant_alreadyCancelled_returns422() throws Exception {
        doThrow(new BusinessRuleException("INVALID_STATE", "Tenant is already cancelled"))
                .when(superAdminTenantService).cancelTenant(eq(TENANT_ID), any());

        mockMvc.perform(delete("/api/v1/super-admin/tenants/{id}", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── feature flags ─────────────────────────────────────────────────────────

    @Test
    void getTenantFeatureFlags_returns200() throws Exception {
        when(featureFlagService.getAllForTenantById(TENANT_ID.toString()))
                .thenReturn(List.of(
                        new FeatureFlagResponse("payroll.advanced", true, "Advanced payroll features")));

        mockMvc.perform(get("/api/v1/super-admin/tenants/{id}/feature-flags", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].featureKey").value("payroll.advanced"))
                .andExpect(jsonPath("$[0].enabled").value(true));
    }

    @Test
    void enableTenantFeatureFlag_returns200() throws Exception {
        when(featureFlagService.enableForTenant(TENANT_ID.toString(), "payroll.advanced"))
                .thenReturn(new FeatureFlagResponse("payroll.advanced", true, null));

        mockMvc.perform(put("/api/v1/super-admin/tenants/{id}/feature-flags/payroll.advanced/enable", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void disableTenantFeatureFlag_returns200() throws Exception {
        when(featureFlagService.disableForTenant(TENANT_ID.toString(), "payroll.advanced"))
                .thenReturn(new FeatureFlagResponse("payroll.advanced", false, null));

        mockMvc.perform(put("/api/v1/super-admin/tenants/{id}/feature-flags/payroll.advanced/disable", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
    }

    // ── tenant detail ─────────────────────────────────────────────────────────

    @Test
    void getTenantDetail_returns200WithEnrichedFields() throws Exception {
        com.andikisha.tenant.application.dto.response.TenantDetailResponse detail =
                new com.andikisha.tenant.application.dto.response.TenantDetailResponse(
                        TENANT_ID, "Acme Corp", "acme", "ACTIVE",
                        java.time.LocalDateTime.of(2026, 1, 15, 10, 0),
                        "admin@acme.com", "+254700000001",
                        "P051234567A", "6000001", "SH/001/001",
                        "MONTHLY", 28, null, null, null);

        when(superAdminTenantService.getTenantDetail(TENANT_ID)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/super-admin/tenants/{id}", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.adminEmail").value("admin@acme.com"))
                .andExpect(jsonPath("$.kraPin").value("P051234567A"))
                .andExpect(jsonPath("$.payDay").value(28));
    }
}
