package com.andikisha.auth.e2e;

import com.andikisha.auth.application.dto.response.RolePermissionsResponse;
import com.andikisha.auth.application.dto.response.TenantUserResponse;
import com.andikisha.auth.application.service.RolePermissionQueryService;
import com.andikisha.auth.infrastructure.config.SecurityConfig;
import com.andikisha.auth.infrastructure.config.WebMvcConfig;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.auth.presentation.filter.JwtAuthenticationFilter;
import com.andikisha.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(com.andikisha.auth.presentation.controller.RoleController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class, SecurityConfig.class,
        JwtAuthenticationFilter.class})
class RoleControllerTest {

    private static final String TENANT_ID = "e2e-tenant";

    @Autowired MockMvc mockMvc;

    @MockitoBean RolePermissionQueryService queryService;
    @MockitoBean JwtTokenProvider jwtTokenProvider;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001", roles = "ADMIN")
    void listRoles_asAdmin_returnsMatrix() throws Exception {
        when(queryService.listRolePermissions()).thenReturn(List.of(
                new RolePermissionsResponse("ADMIN", List.of("employee:read:all", "payroll:approve:all")),
                new RolePermissionsResponse("HR_OFFICER", List.of("employee:read:all"))));

        mockMvc.perform(get("/api/v1/auth/roles").header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[0].permissions[0]").value("employee:read:all"))
                .andExpect(jsonPath("$[1].role").value("HR_OFFICER"));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001", roles = "ADMIN")
    void listUsers_asAdmin_returnsUsersWithRoles() throws Exception {
        when(queryService.listTenantUsers()).thenReturn(List.of(
                new TenantUserResponse("u1", "jane@demo.co.ke", "Jane Wanjiku", "HR_OFFICER", "emp1", "2026-06-10T09:00:00", true)));

        mockMvc.perform(get("/api/v1/auth/users").header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("jane@demo.co.ke"))
                .andExpect(jsonPath("$[0].role").value("HR_OFFICER"));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000002", roles = "EMPLOYEE")
    void listRoles_asNonAdmin_isForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/auth/roles").header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isForbidden());
    }
}
