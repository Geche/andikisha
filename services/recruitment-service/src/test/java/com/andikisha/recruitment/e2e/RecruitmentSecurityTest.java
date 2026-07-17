package com.andikisha.recruitment.e2e;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.recruitment.application.service.InterviewService;
import com.andikisha.recruitment.application.service.PipelineTemplateService;
import com.andikisha.recruitment.infrastructure.config.SecurityConfig;
import com.andikisha.recruitment.infrastructure.config.WebMvcConfig;
import com.andikisha.recruitment.presentation.controller.InterviewController;
import com.andikisha.recruitment.presentation.controller.PipelineTemplateController;
import com.andikisha.recruitment.presentation.filter.TrustedHeaderAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {PipelineTemplateController.class, InterviewController.class})
@Import({GlobalExceptionHandler.class, WebMvcConfig.class, SecurityConfig.class, TrustedHeaderAuthFilter.class})
class RecruitmentSecurityTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean PipelineTemplateService templateService;
    @MockitoBean InterviewService interviewService;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT = "e2e-tenant";
    private static final String USER = "user-1";
    private static final String TEMPLATE_BODY =
            "{\"name\":\"Custom\",\"stages\":[{\"name\":\"Applied\",\"category\":\"APPLIED\"},"
                    + "{\"name\":\"Hired\",\"category\":\"HIRED\"},{\"name\":\"Rejected\",\"category\":\"REJECTED\"}]}";

    // ── Reads: PAYROLL_OFFICER excluded; ADMIN / HR_MANAGER / HR_OFFICER allowed ──

    @Test
    void listTemplates_withPayrollOfficer_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "PAYROLL_OFFICER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listTemplates_withEmployee_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listTemplates_withHrOfficer_returns200() throws Exception {
        when(templateService.listTemplates()).thenReturn(List.of());
        mockMvc.perform(get("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "HR_OFFICER"))
                .andExpect(status().isOk());
    }

    @Test
    void listTemplates_withAdmin_returns200() throws Exception {
        when(templateService.listTemplates()).thenReturn(List.of());
        mockMvc.perform(get("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    void listTemplates_withHrManager_returns200() throws Exception {
        when(templateService.listTemplates()).thenReturn(List.of());
        mockMvc.perform(get("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isOk());
    }

    // ── Writes: only ADMIN / HR_MANAGER; HR_OFFICER rejected ──────────────────────

    @Test
    void createTemplate_withHrOfficer_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "HR_OFFICER")
                        .contentType(MediaType.APPLICATION_JSON).content(TEMPLATE_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    void createTemplate_withHrManager_returns201() throws Exception {
        when(templateService.createTemplate(any())).thenReturn(
                new com.andikisha.recruitment.application.dto.response.PipelineTemplateResponse(
                        UUID.randomUUID(), "Custom", true, List.of()));
        mockMvc.perform(post("/api/v1/recruitment/pipeline-templates")
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON).content(TEMPLATE_BODY))
                .andExpect(status().isCreated());
    }

    // ── /me feedback: PAYROLL_OFFICER excluded; Form-B ownership → NOT_OWNER ───────

    @Test
    void submitFeedback_withPayrollOfficer_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/recruitment/interviews/{id}/feedback", UUID.randomUUID())
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "PAYROLL_OFFICER")
                        .header("X-Employee-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":4,\"recommendation\":\"YES\",\"comments\":\"ok\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void submitFeedback_byNonOwnerLineManager_returns422NotOwner() throws Exception {
        when(interviewService.submitFeedback(any(), any(), any()))
                .thenThrow(new BusinessRuleException("NOT_OWNER",
                        "You can only submit feedback for interviews assigned to you"));

        mockMvc.perform(post("/api/v1/recruitment/interviews/{id}/feedback", UUID.randomUUID())
                        .header("X-Tenant-ID", TENANT).header("X-User-ID", USER)
                        .header("X-User-Role", "LINE_MANAGER")
                        .header("X-Employee-ID", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":4,\"recommendation\":\"YES\",\"comments\":\"ok\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("NOT_OWNER"));
    }
}
