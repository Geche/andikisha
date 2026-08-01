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
import com.andikisha.common.security.TrustedHeaderAuthFilter;
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

import static org.hamcrest.Matchers.hasItems;
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
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    // ── self-setup (AUTH-BACKLOG-001) ───────────────────────────────────────────

    @Test
    void selfSetup_validRequest_returns201() throws Exception {
        when(employeeService.selfSetup(any(), any(), any(), any(), any(), any()))
                .thenReturn(new com.andikisha.employee.application.dto.response.SelfSetupResponse(
                        EMPLOYEE_ID.toString(), "EMP-0001", true));

        mockMvc.perform(post("/api/v1/employees/self")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Email", "admin@acme.co.ke")
                        .header("X-User-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Ada\",\"lastName\":\"Ok\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value(EMPLOYEE_ID.toString()))
                .andExpect(jsonPath("$.pendingActivation").value(true));
    }

    @Test
    void selfSetup_whenAlreadyLinked_returns409() throws Exception {
        mockMvc.perform(post("/api/v1/employees/self")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Email", "admin@acme.co.ke")
                        .header("X-User-Role", "ADMIN")
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Ada\",\"lastName\":\"Ok\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("ALREADY_LINKED"));
    }

    @Test
    void selfSetup_superAdmin_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/employees/self")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Email", "root@andikisha.com")
                        .header("X-User-Role", "SUPER_ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Root\",\"lastName\":\"Admin\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void selfSetup_systemTenant_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/employees/self")
                        .header("X-Tenant-ID", "SYSTEM")
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Email", "root@andikisha.com")
                        .header("X-User-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Root\",\"lastName\":\"Admin\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void selfSetup_bodyCarriesEmail_returns400() throws Exception {
        // Identity comes from the gateway headers; a body that smuggles email is rejected.
        mockMvc.perform(post("/api/v1/employees/self")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Email", "admin@acme.co.ke")
                        .header("X-User-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Ada\",\"lastName\":\"Ok\",\"email\":\"other@evil.co\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void selfSetup_matchingEmailExists_returns409EmailInUse() throws Exception {
        when(employeeService.selfSetup(any(), any(), any(), any(), any(), any()))
                .thenThrow(new com.andikisha.employee.domain.exception.SelfSetupConflictException(
                        "EMAIL_IN_USE", "An employee record already exists for your email."));

        mockMvc.perform(post("/api/v1/employees/self")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Email", "admin@acme.co.ke")
                        .header("X-User-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Ada\",\"lastName\":\"Ok\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("EMAIL_IN_USE"));
    }

    @Test
    void getById_whenNotFound_returns404() throws Exception {
        when(queryService.findById(EMPLOYEE_ID))
                .thenThrow(new EmployeeNotFoundException(EMPLOYEE_ID));

        mockMvc.perform(get("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void getById_whenFound_returns200WithFullDetails() throws Exception {
        when(queryService.findById(EMPLOYEE_ID)).thenReturn(minimalResponse());

        mockMvc.perform(get("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
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
    void create_missingStatutoryAndIdFields_returns400_eachStillRequired() throws Exception {
        // Guard for EMP-BACKLOG-002 / V10: the migration made national_id,
        // phone_number, kra_pin, nhif_number, nssf_number NULLABLE in the DB (for
        // bulk pending-activation imports). Single-employee creation must STILL
        // require all five via @NotBlank — the DB change must not loosen the form.
        String body = """
                {
                  "firstName": "Jane",
                  "lastName": "Doe",
                  "employmentType": "PERMANENT",
                  "basicSalary": 50000
                }
                """;

        mockMvc.perform(post("/api/v1/employees")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItems(
                        "nationalId", "phoneNumber", "kraPin", "nhifNumber", "nssfNumber")));
    }

    // ── update KRA PIN validation (EMP-BACKLOG-004) ─────────────────────────────

    @Test
    void update_malformedKraPin_returns400() throws Exception {
        mockMvc.perform(put("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kraPin\":\"NOTAPIN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void update_validKraPin_returns200() throws Exception {
        when(employeeService.update(any(), any(), any())).thenReturn(minimalResponse());

        mockMvc.perform(put("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kraPin\":\"A123456789X\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void update_emptyKraPin_isAllowed_returns200() throws Exception {
        when(employeeService.update(any(), any(), any())).thenReturn(minimalResponse());

        mockMvc.perform(put("/api/v1/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"kraPin\":\"\"}"))
                .andExpect(status().isOk());
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

    @Test
    @org.junit.jupiter.api.DisplayName("GET /api/v1/employees with EMPLOYEE role returns 200 with OWN scope")
    void listEmployees_withEmployeeRole_returns200WithOwnScope() throws Exception {
        // EMPLOYEE now has access — filtered to own record via CallerScopeResolver (OWN scope)
        when(queryService.findAll(any(), any(), any(), any(), any(), any()))
                .thenReturn(org.springframework.data.domain.Page.empty());
        mockMvc.perform(get("/api/v1/employees")
                        .header("X-User-ID", "emp-user-1")
                        .header("X-User-Role", "EMPLOYEE")
                        .header("X-Employee-ID", "00000000-0000-0000-0000-000000000001")
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isOk());
    }

    @Test
    @org.junit.jupiter.api.DisplayName("GET /api/v1/employees with HR_MANAGER role returns 200")
    void listEmployees_withHrManagerRole_returns200() throws Exception {
        when(queryService.findAll(any(), any(), any(), any(), any(), any()))
                .thenReturn(org.springframework.data.domain.Page.empty());
        mockMvc.perform(get("/api/v1/employees")
                        .header("X-User-ID", "hr-user-1")
                        .header("X-User-Role", "HR_MANAGER")
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isOk());
    }

    @Test
    @org.junit.jupiter.api.DisplayName("EMPLOYEE accessing own record returns 200")
    void getEmployee_employeeAccessingOwnRecord_returns200() throws Exception {
        String employeeId = "00000000-0000-0000-0000-000000000001";
        when(queryService.findById(UUID.fromString(employeeId)))
                .thenReturn(new EmployeeDetailResponse(
                        UUID.fromString(employeeId), TENANT_ID, "EMP-0001",
                        "Jane", "Doe",
                        "12345678", "+254700000001", null,
                        "A123456789B", "1234567", "9876543",
                        null, null,
                        null, null, null, null,
                        "PERMANENT", "ACTIVE",
                        java.math.BigDecimal.valueOf(150_000), java.math.BigDecimal.ZERO, java.math.BigDecimal.ZERO,
                        java.math.BigDecimal.ZERO, java.math.BigDecimal.ZERO,
                        java.math.BigDecimal.ZERO,
                        java.math.BigDecimal.valueOf(150_000), "KES",
                        java.time.LocalDate.now().minusMonths(1), null, null,
                        null, null,
                        null, null, null, null, // personalEmail, emergencyContactName, emergencyContactPhone, avatarUrl
                        java.time.LocalDateTime.now()
                ));
        // SEC-BACKLOG-001: X-User-ID (the USER id) deliberately differs from the employee id. Self-access
        // must succeed on the X-Employee-ID match alone — proving the compare is against the employee
        // identity (authentication.credentials), not authentication.name (the user id).
        mockMvc.perform(get("/api/v1/employees/{id}", employeeId)
                        .header("X-User-ID", "user-99999999")
                        .header("X-User-Role", "EMPLOYEE")
                        .header("X-Employee-ID", employeeId)
                        .header("X-Tenant-ID", "tenant-abc"))
                .andExpect(status().isOk());
    }

    @Test
    @org.junit.jupiter.api.DisplayName("EMPLOYEE accessing another employee record returns 403")
    void getEmployee_employeeAccessingOtherRecord_returns403() throws Exception {
        String myEmployeeId = "00000000-0000-0000-0000-000000000001";
        String otherId      = "00000000-0000-0000-0000-000000000002";
        // Caller is a valid employee (X-Employee-ID present) but requests a different employee's id.
        mockMvc.perform(get("/api/v1/employees/{id}", otherId)
                        .header("X-User-ID", "user-99999999")
                        .header("X-User-Role", "EMPLOYEE")
                        .header("X-Employee-ID", myEmployeeId)
                        .header("X-Tenant-ID", "tenant-abc"))
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
                BigDecimal.ZERO,
                BigDecimal.valueOf(150_000), "KES",
                LocalDate.now().minusMonths(1), null, null,
                null, null,
                null, null, null, null,  // personalEmail, emergencyContactName, emergencyContactPhone, avatarUrl
                LocalDateTime.now()
        );
    }
}
