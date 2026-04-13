package com.andikisha.tenant.e2e;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.tenant.application.dto.response.TenantResponse;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        com.andikisha.tenant.presentation.controller.TenantController.class,
        com.andikisha.tenant.presentation.advice.TenantExceptionHandler.class
})
@Import({
        com.andikisha.tenant.infrastructure.config.SecurityConfig.class,
        com.andikisha.tenant.presentation.filter.TrustedHeaderAuthFilter.class,
        com.andikisha.common.exception.GlobalExceptionHandler.class
})
class TenantControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // @EnableJpaAuditing on TenantServiceApplication needs this mock in web-layer slice tests
    @MockitoBean private JpaMetamodelMappingContext jpaMetamodelMappingContext;
    @MockitoBean private TenantService tenantService;

    @Test
    void createTenant_withValidRequest_returns201() throws Exception {
        UUID id = UUID.randomUUID();
        var response = new TenantResponse(id, "Acme Ltd", "KE", "KES",
                null, null, null, "admin@acme.co.ke", "+254722000001",
                "TRIAL", "Starter", "STARTER", null,
                "MONTHLY", 28, LocalDateTime.now());

        when(tenantService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/tenants")
                        .header("X-User-ID", "system")
                        .header("X-User-Role", "SYSTEM")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "companyName": "Acme Ltd",
                                "country": "KE",
                                "currency": "KES",
                                "adminEmail": "admin@acme.co.ke",
                                "adminPhone": "+254722000001",
                                "planName": "Starter"
                            }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.companyName").value("Acme Ltd"))
                .andExpect(jsonPath("$.status").value("TRIAL"));
    }

    @Test
    void createTenant_withInvalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/tenants")
                        .header("X-User-ID", "system")
                        .header("X-User-Role", "SYSTEM")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "companyName": "Acme Ltd",
                                "country": "KE",
                                "currency": "KES",
                                "adminEmail": "not-an-email",
                                "adminPhone": "+254722000001"
                            }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void createTenant_withInvalidPhone_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/tenants")
                        .header("X-User-ID", "system")
                        .header("X-User-Role", "SYSTEM")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "companyName": "Acme Ltd",
                                "country": "KE",
                                "currency": "KES",
                                "adminEmail": "admin@acme.co.ke",
                                "adminPhone": "12345"
                            }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void createTenant_withDuplicateEmail_returns409() throws Exception {
        when(tenantService.create(any()))
                .thenThrow(new DuplicateResourceException("Tenant", "adminEmail", "admin@acme.co.ke"));

        mockMvc.perform(post("/api/v1/tenants")
                        .header("X-User-ID", "system")
                        .header("X-User-Role", "SYSTEM")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "companyName": "Acme Ltd",
                                "country": "KE",
                                "currency": "KES",
                                "adminEmail": "admin@acme.co.ke",
                                "adminPhone": "+254722000001"
                            }
                        """))
                .andExpect(status().isConflict());
    }

    @Test
    void getTenant_whenExists_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        var response = new TenantResponse(id, "Acme Ltd", "KE", "KES",
                null, null, null, "admin@acme.co.ke", "+254722000001",
                "ACTIVE", "Starter", "STARTER", null,
                "MONTHLY", 28, LocalDateTime.now());

        when(tenantService.getById(id)).thenReturn(response);

        // PLATFORM_ADMIN is required — the endpoint is @PreAuthorize("hasRole('PLATFORM_ADMIN')")
        mockMvc.perform(get("/api/v1/tenants/{id}", id)
                        .header("X-User-ID", id.toString())
                        .header("X-User-Role", "PLATFORM_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.companyName").value("Acme Ltd"));
    }

    @Test
    void getTenant_withNonPlatformAdmin_returns403() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/tenants/{id}", id)
                        .header("X-User-ID", id.toString())
                        .header("X-User-Role", "TENANT_ADMIN"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getTenant_whenNotFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(tenantService.getById(id)).thenThrow(new TenantNotFoundException(id));

        // PLATFORM_ADMIN required to reach the endpoint
        mockMvc.perform(get("/api/v1/tenants/{id}", id)
                        .header("X-User-ID", id.toString())
                        .header("X-User-Role", "PLATFORM_ADMIN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void listAll_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/tenants"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TENANT_ADMIN")
    void listAll_withTenantAdminRole_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/tenants"))
                .andExpect(status().isForbidden());
    }
}
