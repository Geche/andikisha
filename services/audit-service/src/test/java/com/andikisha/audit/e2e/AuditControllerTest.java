package com.andikisha.audit.e2e;

import com.andikisha.audit.application.dto.response.AuditEntryResponse;
import com.andikisha.audit.application.dto.response.AuditSummaryResponse;
import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.infrastructure.config.SecurityConfig;
import com.andikisha.audit.infrastructure.config.WebMvcConfig;
import com.andikisha.audit.presentation.advice.AuditExceptionHandler;
import com.andikisha.audit.presentation.controller.AuditController;
import com.andikisha.audit.presentation.filter.TrustedHeaderAuthFilter;
import com.andikisha.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuditController.class)
@Import({AuditExceptionHandler.class, GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, TrustedHeaderAuthFilter.class})
class AuditControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean AuditService auditService;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT = "e2e-audit-tenant";

    // ── GET /api/v1/audit ──────────────────────────────────────────────────────

    @Test
    void listAll_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listAll_withTenantHeader_returns200WithPage() throws Exception {
        AuditEntryResponse entry = buildResponse("EMPLOYEE", "CREATE");
        when(auditService.listAll(any())).thenReturn(new PageImpl<>(List.of(entry)));

        mockMvc.perform(get("/api/v1/audit")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].domain").value("EMPLOYEE"))
                .andExpect(jsonPath("$.content[0].action").value("CREATE"))
                .andExpect(jsonPath("$.content[0].resourceType").value("Employee"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void listAll_emptyResult_returnsEmptyPage() throws Exception {
        when(auditService.listAll(any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/audit")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // ── GET /api/v1/audit/domain/{domain} ─────────────────────────────────────

    @Test
    void byDomain_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit/domain/EMPLOYEE"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void byDomain_validDomain_returns200() throws Exception {
        AuditEntryResponse entry = buildResponse("EMPLOYEE", "CREATE");
        when(auditService.listByDomain(eq("EMPLOYEE"), any()))
                .thenReturn(new PageImpl<>(List.of(entry)));

        mockMvc.perform(get("/api/v1/audit/domain/EMPLOYEE")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].domain").value("EMPLOYEE"));
    }

    @Test
    void byDomain_invalidDomain_returns400() throws Exception {
        when(auditService.listByDomain(eq("INVALID"), any()))
                .thenThrow(new IllegalArgumentException("No enum constant for INVALID"));

        mockMvc.perform(get("/api/v1/audit/domain/INVALID")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"));
    }

    // ── GET /api/v1/audit/action/{action} ─────────────────────────────────────

    @Test
    void byAction_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit/action/CREATE"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void byAction_validAction_returns200() throws Exception {
        AuditEntryResponse entry = buildResponse("PAYROLL", "APPROVE");
        when(auditService.listByAction(eq("APPROVE"), any()))
                .thenReturn(new PageImpl<>(List.of(entry)));

        mockMvc.perform(get("/api/v1/audit/action/APPROVE")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].action").value("APPROVE"));
    }

    @Test
    void byAction_invalidAction_returns400() throws Exception {
        when(auditService.listByAction(eq("BADACTION"), any()))
                .thenThrow(new IllegalArgumentException("No enum constant for BADACTION"));

        mockMvc.perform(get("/api/v1/audit/action/BADACTION")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"));
    }

    // ── GET /api/v1/audit/resource/{type}/{id} ────────────────────────────────

    @Test
    void byResource_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit/resource/Employee/emp-1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void byResource_withTenantHeader_returns200() throws Exception {
        AuditEntryResponse entry = buildResponse("EMPLOYEE", "UPDATE");
        when(auditService.listByResource(eq("Employee"), eq("emp-1"), any()))
                .thenReturn(new PageImpl<>(List.of(entry)));

        mockMvc.perform(get("/api/v1/audit/resource/Employee/emp-1")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // ── GET /api/v1/audit/actor/{actorId} ────────────────────────────────────

    @Test
    void byActor_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit/actor/user-1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void byActor_withTenantHeader_returns200() throws Exception {
        when(auditService.listByActor(eq("user-1"), any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/audit/actor/user-1")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk());
    }

    // ── GET /api/v1/audit/date-range ──────────────────────────────────────────

    @Test
    void byDateRange_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit/date-range")
                        .param("from", "2026-04-01")
                        .param("to", "2026-04-30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void byDateRange_withValidParams_returns200() throws Exception {
        when(auditService.listByDateRange(any(), any(), any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/audit/date-range")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT)
                        .param("from", "2026-04-01")
                        .param("to", "2026-04-30"))
                .andExpect(status().isOk());
    }

    // ── GET /api/v1/audit/summary ─────────────────────────────────────────────

    @Test
    void summary_missingTenantHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit/summary")
                        .param("from", "2026-04-01")
                        .param("to", "2026-04-30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void summary_withValidParams_returns200() throws Exception {
        AuditSummaryResponse response = new AuditSummaryResponse(42L, List.of(
                new AuditSummaryResponse.DomainActionCount("EMPLOYEE", "CREATE", 5L),
                new AuditSummaryResponse.DomainActionCount("LEAVE", "APPROVE", 3L)
        ));
        when(auditService.getSummary(any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/audit/summary")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT)
                        .param("from", "2026-04-01")
                        .param("to", "2026-04-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEntries").value(42))
                .andExpect(jsonPath("$.breakdown[0].domain").value("EMPLOYEE"))
                .andExpect(jsonPath("$.breakdown[0].action").value("CREATE"))
                .andExpect(jsonPath("$.breakdown[0].count").value(5))
                .andExpect(jsonPath("$.breakdown[1].domain").value("LEAVE"))
                .andExpect(jsonPath("$.breakdown[1].count").value(3));
    }

    // ── security tests ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/v1/audit without auth returns 401")
    void listAuditEntries_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/audit")
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/audit with ADMIN role returns 200")
    void listAuditEntries_withAdminRole_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/audit")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isOk());
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private AuditEntryResponse buildResponse(String domain, String action) {
        return new AuditEntryResponse(
                UUID.randomUUID(), domain, action,
                "Employee", "res-1",
                "actor-1", "Test Actor",
                "description", "event.type",
                Instant.now(), Instant.now()
        );
    }
}
