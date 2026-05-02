package com.andikisha.integration.e2e;

import com.andikisha.integration.application.dto.response.IntegrationConfigResponse;
import com.andikisha.integration.application.service.IntegrationConfigService;
import com.andikisha.integration.infrastructure.config.SecurityConfig;
import com.andikisha.integration.presentation.controller.IntegrationConfigController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IntegrationConfigController.class)
@Import({SecurityConfig.class, WebMvcTestSecurityConfig.class})
class IntegrationConfigControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean IntegrationConfigService configService;

    private static final String TENANT_ID = "tenant-e2e-test";

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void configure_happyPath_returns200() throws Exception {
        when(configService.configure(any()))
                .thenReturn(new IntegrationConfigResponse(
                        "MPESA_B2C", "600100", "sandbox", false, true));

        mockMvc.perform(post("/api/v1/integrations/configure")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "integrationType", "MPESA_B2C",
                                "apiKey", "test-key",
                                "shortcode", "600100",
                                "callbackUrl", "https://example.com/callback"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.integrationType").value("MPESA_B2C"))
                .andExpect(jsonPath("$.environment").value("sandbox"))
                .andExpect(jsonPath("$.configured").value(true));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void configure_missingIntegrationType_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/integrations/configure")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "apiKey", "test-key"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void activate_validType_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/integrations/MPESA_B2C/activate")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk());

        verify(configService).activate(
                com.andikisha.integration.domain.model.IntegrationType.MPESA_B2C);
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void activate_invalidEnumValue_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/integrations/INVALID_TYPE/activate")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void list_returns200WithConfigs() throws Exception {
        when(configService.listConfigs()).thenReturn(List.of(
                new IntegrationConfigResponse("MPESA_B2C", "600100", "sandbox", true, true),
                new IntegrationConfigResponse("KRA_ITAX", null, "production", false, false)
        ));

        mockMvc.perform(get("/api/v1/integrations")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].integrationType").value("MPESA_B2C"))
                .andExpect(jsonPath("$[0].active").value(true));
    }
}
