package com.andikisha.employee.e2e;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.service.EmployeeQueryService;
import com.andikisha.employee.application.service.EmployeeService;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.employee.infrastructure.config.SecurityConfig;
import com.andikisha.employee.infrastructure.config.WebMvcConfig;
import com.andikisha.employee.presentation.advice.EmployeeExceptionHandler;
import com.andikisha.employee.presentation.filter.TrustedHeaderAuthFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(com.andikisha.employee.presentation.controller.EmployeeController.class)
@Import({EmployeeExceptionHandler.class, GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, TrustedHeaderAuthFilter.class})
class EmployeeControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean EmployeeService employeeService;
    @MockitoBean EmployeeQueryService queryService;

    // @EnableJpaAuditing on the application class requires jpaMappingContext,
    // which is not loaded by @WebMvcTest. Mock it to allow the context to start.
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT_ID   = "e2e-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final String USER_ID     = "admin-user";

    @Test
    void list_missingTenantHeader_returns400() throws Exception {
        // Auth passes; TenantInterceptor rejects missing X-Tenant-ID with 400
        mockMvc.perform(get("/api/v1/employees")
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_whenNotFound_returns404() throws Exception {
        when(queryService.findById(EMPLOYEE_ID))
                .thenThrow(new EmployeeNotFoundException(EMPLOYEE_ID));

        mockMvc.perform(get("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void getById_whenFound_returns200WithFullDetails() throws Exception {
        when(queryService.findById(EMPLOYEE_ID)).thenReturn(minimalResponse());

        mockMvc.perform(get("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(EMPLOYEE_ID.toString()))
                .andExpect(jsonPath("$.nationalId").value("12345678"));
    }

    @Test
    void create_withInvalidBody_returns400WithValidationErrors() throws Exception {
        // Missing firstName (@NotBlank), negative basicSalary (@Positive)
        String invalidBody = """
                {
                  "lastName": "Doe",
                  "nationalId": "12345678",
                  "phoneNumber": "+254700000001",
                  "kraPin": "A123456789B",
                  "nhifNumber": "1234567",
                  "nssfNumber": "9876543",
                  "employmentType": "PERMANENT",
                  "basicSalary": -500
                }
                """;

        mockMvc.perform(post("/api/v1/employees")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void create_withDuplicateNationalId_returns409() throws Exception {
        when(employeeService.create(any(), any()))
                .thenThrow(new DuplicateResourceException("Employee", "nationalId", "12345678"));

        String validBody = """
                {
                  "firstName": "Jane",
                  "lastName": "Doe",
                  "nationalId": "12345678",
                  "phoneNumber": "+254700000001",
                  "kraPin": "A123456789B",
                  "nhifNumber": "1234567",
                  "nssfNumber": "9876543",
                  "employmentType": "PERMANENT",
                  "basicSalary": 150000
                }
                """;

        mockMvc.perform(post("/api/v1/employees")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("DUPLICATE"));
    }

    @Test
    void terminate_withValidRequest_returns204() throws Exception {
        mockMvc.perform(post("/api/v1/employees/{id}/terminate", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Resigned\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void terminate_withMissingReason_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/employees/{id}/terminate", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void create_withUnauthorizedRole_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/employees")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName":"Jane","lastName":"Doe",
                                  "nationalId":"12345678","phoneNumber":"+254700000001",
                                  "kraPin":"A000000001Z","nhifNumber":"NH000001",
                                  "nssfNumber":"NS000001","employmentType":"FULL_TIME",
                                  "basicSalary":50000,"department":"Engineering",
                                  "jobTitle":"Developer","joinDate":"2026-01-01"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void terminate_withUnauthorizedRole_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/employees/{id}/terminate", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Resigned\"}"))
                .andExpect(status().isForbidden());
    }

    private EmployeeDetailResponse minimalResponse() {
        return new EmployeeDetailResponse(
                EMPLOYEE_ID, TENANT_ID, "EMP-0001",
                "Jane", "Doe",
                "12345678", "+254700000001", null,
                "A123456789B", "1234567", "9876543",
                null, null,
                null, null, null, null,
                "PERMANENT", "ACTIVE",
                BigDecimal.valueOf(150_000), BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.valueOf(150_000), "KES",
                LocalDate.now().minusMonths(1), null, null,
                null, null, LocalDateTime.now()
        );
    }
}
