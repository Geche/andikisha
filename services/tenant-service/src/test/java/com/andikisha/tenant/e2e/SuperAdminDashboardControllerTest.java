package com.andikisha.tenant.e2e;

import com.andikisha.tenant.application.dto.response.DashboardMetricsResponse;
import com.andikisha.tenant.application.dto.response.TenantGrowthPointResponse;
import com.andikisha.tenant.application.service.SuperAdminTenantService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        com.andikisha.tenant.presentation.controller.SuperAdminDashboardController.class,
        com.andikisha.tenant.presentation.advice.TenantExceptionHandler.class
})
@Import({
        com.andikisha.tenant.infrastructure.config.SecurityConfig.class,
        com.andikisha.tenant.presentation.filter.TrustedHeaderAuthFilter.class,
        com.andikisha.common.exception.GlobalExceptionHandler.class
})
class SuperAdminDashboardControllerTest {

    @Autowired private MockMvc mockMvc;

    // @EnableJpaAuditing on TenantServiceApplication requires this mock in slice tests.
    @MockitoBean private JpaMetamodelMappingContext jpaMetamodelMappingContext;
    @MockitoBean private SuperAdminTenantService superAdminTenantService;

    @Test
    void getMetrics_asSuperAdmin_returns200WithKpiFields() throws Exception {
        when(superAdminTenantService.getDashboardMetrics())
                .thenReturn(new DashboardMetricsResponse(
                        42L, 30L, 5L, 2L, 3L, 4L, 7L, 5L));

        mockMvc.perform(get("/api/v1/super-admin/dashboard/metrics")
                        .header("X-User-ID", "system")
                        .header("X-User-Role", "SUPER_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTenants").value(42))
                .andExpect(jsonPath("$.activeTenants").value(30))
                .andExpect(jsonPath("$.trialsExpiringIn7Days").value(5))
                .andExpect(jsonPath("$.trialsExpiringIn48Hours").value(2))
                .andExpect(jsonPath("$.suspendedTenants").value(4))
                .andExpect(jsonPath("$.tenantDeltaThisMonth").value(7))
                .andExpect(jsonPath("$.activeDeltaThisMonth").value(5));
    }

    @Test
    void getGrowth_asSuperAdmin_returns200WithJsonArray() throws Exception {
        when(superAdminTenantService.getTenantGrowth(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(List.of(
                        new TenantGrowthPointResponse("Apr 2026", 3L, 2L),
                        new TenantGrowthPointResponse("May 2026", 5L, 4L)
                ));

        mockMvc.perform(get("/api/v1/super-admin/dashboard/growth")
                        .header("X-User-ID", "system")
                        .header("X-User-Role", "SUPER_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].month").value("Apr 2026"))
                .andExpect(jsonPath("$[0].newSignups").value(3))
                .andExpect(jsonPath("$[0].activeTenants").value(2))
                .andExpect(jsonPath("$[1].month").value("May 2026"));
    }

    // Unauthenticated requests return 403 in this codebase: SecurityConfig has no
    // authentication entry point configured, so Spring Security's AccessDeniedHandler
    // path is taken. The task spec said "401" — that is incorrect for this stack;
    // the existing TenantControllerTest (listAll_withoutAuth_returns403) confirms 403.
    @Test
    void getMetrics_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/super-admin/dashboard/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getGrowth_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/super-admin/dashboard/growth"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMetrics_asNonSuperAdmin_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/super-admin/dashboard/metrics")
                        .header("X-User-ID", "user-1")
                        .header("X-User-Role", "TENANT_ADMIN"))
                .andExpect(status().isForbidden());
    }
}
