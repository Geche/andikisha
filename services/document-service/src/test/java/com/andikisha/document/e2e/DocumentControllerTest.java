package com.andikisha.document.e2e;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.application.service.DocumentService;
import com.andikisha.document.infrastructure.config.SecurityConfig;
import com.andikisha.document.infrastructure.config.WebMvcConfig;
import com.andikisha.document.presentation.controller.DocumentController;
import com.andikisha.document.presentation.filter.TrustedHeaderAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, TrustedHeaderAuthFilter.class})
class DocumentControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean DocumentService documentService;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT_ID   = "e2e-tenant";
    private static final UUID   DOC_ID      = UUID.randomUUID();
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final UUID   RUN_ID      = UUID.randomUUID();

    // -------------------------------------------------------------------------
    // GET /api/v1/documents — listAll
    // -------------------------------------------------------------------------

    @Test
    void listAll_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/documents")
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listAll_happyPath_returns200WithPage() throws Exception {
        when(documentService.listAll(any()))
                .thenReturn(new PageImpl<>(List.of(stubResponse()), PageRequest.of(0, 25), 1));

        mockMvc.perform(get("/api/v1/documents")
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/documents/{id} — getById
    // -------------------------------------------------------------------------

    @Test
    void getById_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/documents/{id}", DOC_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_happyPath_returns200() throws Exception {
        DocumentResponse response = stubResponse();
        when(documentService.getById(DOC_ID)).thenReturn(response);

        mockMvc.perform(get("/api/v1/documents/{id}", DOC_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentType").value("PAYSLIP"));
    }

    @Test
    void getById_unknownDocument_returns404() throws Exception {
        when(documentService.getById(DOC_ID))
                .thenThrow(new ResourceNotFoundException("Document", DOC_ID));

        mockMvc.perform(get("/api/v1/documents/{id}", DOC_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/documents/{id}/download
    // -------------------------------------------------------------------------

    @Test
    void download_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/documents/{id}/download", DOC_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void download_happyPath_returns200WithPdfContent() throws Exception {
        byte[] content = "PDF-BYTES".getBytes();
        DocumentService.DownloadResult result =
                new DocumentService.DownloadResult("payslip.pdf", "application/pdf", content);
        when(documentService.download(DOC_ID)).thenReturn(result);

        mockMvc.perform(get("/api/v1/documents/{id}/download", DOC_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"payslip.pdf\""))
                .andExpect(content().contentType("application/pdf"))
                .andExpect(content().bytes(content));
    }

    @Test
    void download_unknownDocument_returns404() throws Exception {
        when(documentService.download(DOC_ID))
                .thenThrow(new ResourceNotFoundException("Document", DOC_ID));

        mockMvc.perform(get("/api/v1/documents/{id}/download", DOC_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/documents/employees/{employeeId}
    // -------------------------------------------------------------------------

    @Test
    void forEmployee_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/documents/employees/{id}", EMPLOYEE_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void forEmployee_happyPath_returns200() throws Exception {
        when(documentService.getForEmployee(eq(EMPLOYEE_ID), any()))
                .thenReturn(new PageImpl<>(List.of(stubResponse()), PageRequest.of(0, 25), 1));

        mockMvc.perform(get("/api/v1/documents/employees/{id}", EMPLOYEE_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/documents/type/{type}
    // -------------------------------------------------------------------------

    @Test
    void byType_invalidType_returns422() throws Exception {
        when(documentService.getByType(eq("BOGUS"), any()))
                .thenThrow(new BusinessRuleException("INVALID_DOCUMENT_TYPE",
                        "Unknown document type: BOGUS"));

        mockMvc.perform(get("/api/v1/documents/type/BOGUS")
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("INVALID_DOCUMENT_TYPE"));
    }

    @Test
    void byType_validType_returns200() throws Exception {
        when(documentService.getByType(eq("PAYSLIP"), any()))
                .thenReturn(new PageImpl<>(List.of(stubResponse()), PageRequest.of(0, 25), 1));

        mockMvc.perform(get("/api/v1/documents/type/PAYSLIP")
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/documents/payroll-runs/{payrollRunId}
    // -------------------------------------------------------------------------

    @Test
    void forPayrollRun_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/documents/payroll-runs/{id}", RUN_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void forPayrollRun_happyPath_returnsList() throws Exception {
        when(documentService.getForPayrollRun(RUN_ID))
                .thenReturn(List.of(stubResponse()));

        mockMvc.perform(get("/api/v1/documents/payroll-runs/{id}", RUN_ID)
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // -------------------------------------------------------------------------
    // Security role tests
    // -------------------------------------------------------------------------

    @Test
    @org.junit.jupiter.api.DisplayName("GET /api/v1/documents with EMPLOYEE role returns 403")
    void listDocuments_withEmployeeRole_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/documents")
                        .header("X-User-ID", "emp-1")
                        .header("X-User-Role", "EMPLOYEE")
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isForbidden());
    }

    @Test
    @org.junit.jupiter.api.DisplayName("GET /api/v1/documents with HR_MANAGER role returns 200")
    void listDocuments_withHrManagerRole_returns200() throws Exception {
        when(documentService.listAll(any()))
                .thenReturn(new PageImpl<>(List.of(stubResponse()), PageRequest.of(0, 25), 1));
        mockMvc.perform(get("/api/v1/documents")
                        .header("X-User-ID", "hr-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private DocumentResponse stubResponse() {
        return new DocumentResponse(
                DOC_ID, EMPLOYEE_ID, "Jane Mwangi",
                "PAYSLIP", "Payslip Apr-2024",
                "payslip_JM001_2024-04.pdf", 4096L,
                "application/pdf", "READY",
                "2024-04", RUN_ID, "SYSTEM",
                LocalDateTime.of(2024, 4, 30, 10, 0),
                LocalDateTime.of(2024, 4, 30, 10, 0));
    }
}
