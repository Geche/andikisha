package com.andikisha.auth.e2e;

import com.andikisha.auth.application.service.SuperAdminAuthService;
import com.andikisha.auth.infrastructure.config.SecurityConfig;
import com.andikisha.auth.infrastructure.config.WebMvcConfig;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.auth.presentation.advice.AuthExceptionHandler;
import com.andikisha.auth.presentation.controller.SuperAdminSessionController;
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
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SuperAdminSessionController.class)
@Import({AuthExceptionHandler.class, GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, JwtAuthenticationFilter.class})
class SuperAdminSessionControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean SuperAdminAuthService superAdminAuthService;
    @MockitoBean JwtTokenProvider jwtTokenProvider;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    void listSessions_returns401_withoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/super-admin/sessions"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN", username = "00000000-0000-0000-0000-000000000001")
    void listSessions_returns200_withSuperAdminRole() throws Exception {
        when(superAdminAuthService.listActiveSessions(any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/auth/super-admin/sessions"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN", username = "00000000-0000-0000-0000-000000000001")
    void revokeSession_returns204_forValidId() throws Exception {
        UUID sessionId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/auth/super-admin/sessions/" + sessionId))
               .andExpect(status().isNoContent());
    }
}
