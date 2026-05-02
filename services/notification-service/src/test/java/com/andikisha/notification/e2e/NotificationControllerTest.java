package com.andikisha.notification.e2e;

import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.notification.application.dto.response.NotificationResponse;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.infrastructure.config.SecurityConfig;
import com.andikisha.notification.infrastructure.config.WebMvcConfig;
import com.andikisha.notification.presentation.controller.NotificationController;
import com.andikisha.notification.presentation.filter.TrustedHeaderAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, TrustedHeaderAuthFilter.class})
class NotificationControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean NotificationService notificationService;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT_ID = "e2e-tenant";
    private static final UUID   USER_ID   = UUID.randomUUID();

    // -------------------------------------------------------------------------
    // GET /api/v1/notifications/me
    // -------------------------------------------------------------------------

    @Test
    void myNotifications_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/me")
                        .header("X-User-ID", USER_ID.toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void myNotifications_withValidHeaders_returns200() throws Exception {
        NotificationResponse response = sampleResponse();
        when(notificationService.getForRecipient(eq(USER_ID), any()))
                .thenReturn(new PageImpl<>(List.of(response), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/notifications/me")
                        .header("X-User-ID", USER_ID.toString())
                        .header("X-User-Role", "EMPLOYEE")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].subject").value("Test Subject"));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/notifications/me/unread-count
    // -------------------------------------------------------------------------

    @Test
    void unreadCount_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/me/unread-count")
                        .header("X-User-ID", USER_ID.toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unreadCount_withValidHeaders_returnsCount() throws Exception {
        when(notificationService.countUnread(USER_ID)).thenReturn(3L);

        mockMvc.perform(get("/api/v1/notifications/me/unread-count")
                        .header("X-User-ID", USER_ID.toString())
                        .header("X-User-Role", "EMPLOYEE")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(3));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/notifications (admin)
    // -------------------------------------------------------------------------

    @Test
    void listAll_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listAll_withTenantHeader_returns200() throws Exception {
        when(notificationService.listAll(any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/notifications")
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/notifications/employees/{employeeId}
    // -------------------------------------------------------------------------

    @Test
    void forEmployee_withValidTenantHeader_returns200() throws Exception {
        UUID empId = UUID.randomUUID();
        when(notificationService.getForRecipient(eq(empId), any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        mockMvc.perform(get("/api/v1/notifications/employees/{id}", empId)
                        .header("X-User-ID", "admin-user-id")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------------------
    // helpers
    // -------------------------------------------------------------------------

    private NotificationResponse sampleResponse() {
        return new NotificationResponse(
                UUID.randomUUID(), USER_ID, "Alice",
                "EMAIL", "PAYROLL", "Test Subject", "Body",
                "SENT", "NORMAL", LocalDateTime.now(), null, 0, LocalDateTime.now());
    }
}
