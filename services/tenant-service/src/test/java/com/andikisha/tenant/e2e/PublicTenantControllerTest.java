package com.andikisha.tenant.e2e;

import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression guard for the 2026-06-06 P1 incident
 * (docs/Engineering/backend/2026-06-06-P1-gateway-public-resolve-401.md).
 *
 * The public workspace-resolve endpoint MUST be reachable WITHOUT authentication
 * (it is the first call the tenant-portal BFF makes, before login). If this route
 * ever returns 401, every tenant-portal login breaks. These tests assert the
 * permitAll wiring in {@code SecurityConfig} keeps the route public.
 */
@WebMvcTest(controllers = {
        com.andikisha.tenant.presentation.controller.PublicTenantController.class,
        com.andikisha.tenant.presentation.advice.TenantExceptionHandler.class
})
@Import({
        com.andikisha.tenant.infrastructure.config.SecurityConfig.class,
        com.andikisha.tenant.presentation.filter.TrustedHeaderAuthFilter.class,
        com.andikisha.common.exception.GlobalExceptionHandler.class
})
class PublicTenantControllerTest {

    @Autowired private MockMvc mockMvc;

    // @EnableJpaAuditing on the application needs this mock in web-layer slice tests
    @MockitoBean private JpaMetamodelMappingContext jpaMetamodelMappingContext;
    @MockitoBean private TenantService tenantService;

    @Test
    void resolve_knownActiveWorkspace_returns200_withoutAuthentication() throws Exception {
        String tenantId = UUID.randomUUID().toString();
        Tenant tenant = mock(Tenant.class);
        when(tenant.getStatus()).thenReturn(TenantStatus.TRIAL);
        when(tenant.getTenantId()).thenReturn(tenantId);
        when(tenant.getCompanyName()).thenReturn("Andikisha Demo Co");
        when(tenantService.findByWorkspace("andikisha-demo")).thenReturn(Optional.of(tenant));

        // No auth headers / no Authorization — must still reach the controller.
        mockMvc.perform(get("/api/v1/public/workspaces/{w}/resolve", "andikisha-demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantId));
    }

    @Test
    void resolve_unknownWorkspace_returns404_neverUnauthorized() throws Exception {
        when(tenantService.findByWorkspace("does-not-exist")).thenReturn(Optional.empty());

        // The regression point: an unauthenticated request must REACH the controller
        // and get a 404 — never a 401 from the security layer.
        mockMvc.perform(get("/api/v1/public/workspaces/{w}/resolve", "does-not-exist"))
                .andExpect(status().isNotFound());
    }
}
