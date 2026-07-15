package com.andikisha.employee.e2e;

import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.employee.application.service.LifecycleWorkflowService;
import com.andikisha.employee.infrastructure.config.SecurityConfig;
import com.andikisha.employee.infrastructure.config.WebMvcConfig;
import com.andikisha.employee.presentation.advice.EmployeeExceptionHandler;
import com.andikisha.employee.presentation.controller.LifecycleController;
import com.andikisha.employee.presentation.filter.TrustedHeaderAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LifecycleController.class)
@Import({EmployeeExceptionHandler.class, GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, TrustedHeaderAuthFilter.class})
class LifecycleControllerSecurityTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean LifecycleWorkflowService lifecycleService;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT_ID = "e2e-tenant";
    private static final String USER_ID = "user-1";

    @Test
    void listInstances_withPayrollOfficer_returns403() throws Exception {
        // PAYROLL_OFFICER is intentionally NOT in the read role set for lifecycle instances
        mockMvc.perform(get("/api/v1/employees/lifecycle/instances")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "PAYROLL_OFFICER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listTemplates_withPayrollOfficer_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/employees/lifecycle/templates")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "PAYROLL_OFFICER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listInstances_withHrOfficer_returns200() throws Exception {
        when(lifecycleService.listInstances(any(), any())).thenReturn(List.of());
        mockMvc.perform(get("/api/v1/employees/lifecycle/instances")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_OFFICER"))
                .andExpect(status().isOk());
    }

    @Test
    void initiateOnboarding_withEmployeeRole_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/employees/{id}/lifecycle/onboarding", UUID.randomUUID())
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isForbidden());
    }

    @Test
    void initiateOffboarding_withHrOfficer_returns403() throws Exception {
        // Offboarding initiation is ADMIN/HR_MANAGER only — HR_OFFICER must be rejected
        mockMvc.perform(post("/api/v1/employees/{id}/lifecycle/offboarding", UUID.randomUUID())
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_OFFICER"))
                .andExpect(status().isForbidden());
    }
}
