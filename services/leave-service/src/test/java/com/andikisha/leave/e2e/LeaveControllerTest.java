package com.andikisha.leave.e2e;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.leave.application.dto.response.LeaveBalanceResponse;
import com.andikisha.leave.application.dto.response.LeavePolicyResponse;
import com.andikisha.leave.application.dto.response.LeaveRequestResponse;
import com.andikisha.leave.application.service.LeaveBalanceService;
import com.andikisha.leave.application.service.LeavePolicyService;
import com.andikisha.leave.application.service.LeaveService;
import com.andikisha.leave.domain.exception.LeaveRequestNotFoundException;
import com.andikisha.leave.infrastructure.config.WebMvcConfig;
import com.andikisha.leave.presentation.controller.LeaveController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LeaveController.class)
@Import({
        com.andikisha.leave.infrastructure.config.SecurityConfig.class,
        com.andikisha.leave.presentation.filter.TrustedHeaderAuthFilter.class,
        GlobalExceptionHandler.class,
        WebMvcConfig.class
})
class LeaveControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean LeaveService leaveService;
    @MockitoBean LeaveBalanceService balanceService;
    @MockitoBean LeavePolicyService policyService;

    private static final String TENANT_ID   = "e2e-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final UUID   REQUEST_ID  = UUID.randomUUID();
    // authentication.name is set to X-User-ID by TrustedHeaderAuthFilter
    private static final String USER_ID     = EMPLOYEE_ID.toString();

    // ------------------------------------------------------------------
    // POST /api/v1/leave/requests — submit
    // ------------------------------------------------------------------

    @Test
    void submit_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests")
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSubmitJson()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submit_missingBody_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submit_nullLeaveType_returns400WithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"startDate":"2026-05-01","endDate":"2026-05-05","days":5}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void submit_zeroDays_returns400WithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"leaveType":"ANNUAL","startDate":"2026-05-01","endDate":"2026-05-05","days":0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void submit_invalidLeaveType_returns422() throws Exception {
        when(leaveService.submit(any(), any(), any()))
                .thenThrow(new BusinessRuleException("INVALID_LEAVE_TYPE", "Unknown leave type: VACATION"));

        mockMvc.perform(post("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"leaveType":"VACATION","startDate":"2026-05-01","endDate":"2026-05-05","days":5}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("INVALID_LEAVE_TYPE"));
    }

    @Test
    void submit_happyPath_returns201WithResponse() throws Exception {
        when(leaveService.submit(any(), any(), any())).thenReturn(minimalRequestResponse("PENDING"));

        mockMvc.perform(post("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSubmitJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    // ------------------------------------------------------------------
    // POST /api/v1/leave/requests/{id}/approve
    // ------------------------------------------------------------------

    @Test
    void approve_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests/{id}/approve", REQUEST_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void approve_whenRequestNotFound_returns404() throws Exception {
        when(leaveService.approve(eq(REQUEST_ID), any(), any()))
                .thenThrow(new LeaveRequestNotFoundException(REQUEST_ID));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/approve", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void approve_alreadyApproved_returns422() throws Exception {
        when(leaveService.approve(eq(REQUEST_ID), any(), any()))
                .thenThrow(new BusinessRuleException("WRONG_STATUS", "Can only approve a PENDING leave request"));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/approve", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("WRONG_STATUS"));
    }

    @Test
    void approve_happyPath_returns200() throws Exception {
        when(leaveService.approve(eq(REQUEST_ID), any(), any()))
                .thenReturn(minimalRequestResponse("APPROVED"));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/approve", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    // ------------------------------------------------------------------
    // POST /api/v1/leave/requests/{id}/reject
    // ------------------------------------------------------------------

    @Test
    void reject_whenRequestNotFound_returns404() throws Exception {
        when(leaveService.reject(eq(REQUEST_ID), any(), any(), any()))
                .thenThrow(new LeaveRequestNotFoundException(REQUEST_ID));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/reject", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":"Not enough notice"}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void reject_happyPath_returns200() throws Exception {
        when(leaveService.reject(eq(REQUEST_ID), any(), any(), any()))
                .thenReturn(minimalRequestResponse("REJECTED"));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/reject", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":"Not enough notice"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    // ------------------------------------------------------------------
    // POST /api/v1/leave/requests/{id}/cancel
    // ------------------------------------------------------------------

    @Test
    void cancel_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests/{id}/cancel", REQUEST_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cancel_happyPath_returns204() throws Exception {
        doNothing().when(leaveService).cancel(any(), any());

        mockMvc.perform(post("/api/v1/leave/requests/{id}/cancel", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isNoContent());
    }

    @Test
    void cancel_notOwner_returns422() throws Exception {
        doThrow(new BusinessRuleException("NOT_OWNER",
                        "You can only cancel your own leave requests"))
                .when(leaveService).cancel(eq(REQUEST_ID), any());

        mockMvc.perform(post("/api/v1/leave/requests/{id}/cancel", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", UUID.randomUUID().toString())
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("NOT_OWNER"));
    }

    // ------------------------------------------------------------------
    // POST /api/v1/leave/requests/{id}/reverse
    // ------------------------------------------------------------------

    @Test
    void reverse_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests/{id}/reverse", REQUEST_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":"Employee resigned"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reverse_missingReason_returns400WithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/leave/requests/{id}/reverse", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void reverse_whenRequestNotFound_returns404() throws Exception {
        when(leaveService.hrReverse(eq(REQUEST_ID), any(), any(), any()))
                .thenThrow(new LeaveRequestNotFoundException(REQUEST_ID));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/reverse", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":"Employee resigned"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void reverse_nonApprovedRequest_returns422() throws Exception {
        when(leaveService.hrReverse(eq(REQUEST_ID), any(), any(), any()))
                .thenThrow(new BusinessRuleException("WRONG_STATUS",
                        "Cannot reverse a leave request that is not APPROVED"));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/reverse", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":"Employee resigned"}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("WRONG_STATUS"));
    }

    @Test
    void reverse_happyPath_returns200() throws Exception {
        when(leaveService.hrReverse(eq(REQUEST_ID), any(), any(), any()))
                .thenReturn(minimalRequestResponse("CANCELLED"));

        mockMvc.perform(post("/api/v1/leave/requests/{id}/reverse", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rejectionReason":"Employee resigned"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ------------------------------------------------------------------
    // GET /api/v1/leave/requests
    // ------------------------------------------------------------------

    @Test
    void listRequests_missingTenantHeader_returns400() throws Exception {
        // HR_MANAGER role passes auth; TenantInterceptor rejects missing X-Tenant-ID with 400
        mockMvc.perform(get("/api/v1/leave/requests")
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listRequests_withInvalidStatus_returns422() throws Exception {
        when(leaveService.listRequests(eq("BOGUS"), any()))
                .thenThrow(new BusinessRuleException("INVALID_STATUS", "Unknown leave status: BOGUS"));

        mockMvc.perform(get("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER")
                        .param("status", "BOGUS"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("INVALID_STATUS"));
    }

    @Test
    void listRequests_returnsPage() throws Exception {
        when(leaveService.listRequests(any(), any()))
                .thenReturn(new PageImpl<>(
                        List.of(minimalRequestResponse("PENDING")),
                        PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].status").value("PENDING"));
    }

    @Test
    void listRequests_withEmployeeRole_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/leave/requests")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------
    // GET /api/v1/leave/requests/{id}
    // ------------------------------------------------------------------

    @Test
    void getRequest_whenNotFound_returns404() throws Exception {
        when(leaveService.getRequest(REQUEST_ID))
                .thenThrow(new LeaveRequestNotFoundException(REQUEST_ID));

        mockMvc.perform(get("/api/v1/leave/requests/{id}", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "HR_MANAGER"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void getRequest_withEmployeeRole_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/leave/requests/{id}", REQUEST_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------
    // GET /api/v1/leave/employees/{id}/balances
    // ------------------------------------------------------------------

    @Test
    void balances_missingTenantHeader_returns400() throws Exception {
        // X-User-ID matches the path EMPLOYEE_ID so the ownership @PreAuthorize passes;
        // TenantInterceptor then rejects the missing X-Tenant-ID with 400.
        mockMvc.perform(get("/api/v1/leave/employees/{id}/balances", EMPLOYEE_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void balances_returnsListForEmployee() throws Exception {
        when(balanceService.getBalances(eq(EMPLOYEE_ID), anyInt()))
                .thenReturn(List.of(minimalBalanceResponse()));

        // X-User-ID must match the path EMPLOYEE_ID for the ownership @PreAuthorize check
        mockMvc.perform(get("/api/v1/leave/employees/{id}/balances", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].leaveType").value("ANNUAL"));
    }

    // ------------------------------------------------------------------
    // GET /api/v1/leave/policies
    // ------------------------------------------------------------------

    @Test
    void policies_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/leave/policies")
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void policies_returnsPoliciesList() throws Exception {
        when(policyService.getPolicies()).thenReturn(List.of(minimalPolicyResponse()));

        mockMvc.perform(get("/api/v1/leave/policies")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-User-ID", USER_ID)
                        .header("X-User-Role", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].leaveType").value("ANNUAL"));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private String validSubmitJson() {
        return """
                {
                  "leaveType": "ANNUAL",
                  "startDate": "%s",
                  "endDate": "%s",
                  "days": 5,
                  "reason": "Family trip"
                }
                """.formatted(
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(11));
    }

    private LeaveRequestResponse minimalRequestResponse(String status) {
        return new LeaveRequestResponse(
                REQUEST_ID, EMPLOYEE_ID, "Jane Doe", "ANNUAL",
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Family trip", status,
                null, null, null, null, false, LocalDateTime.now());
    }

    private LeaveBalanceResponse minimalBalanceResponse() {
        return new LeaveBalanceResponse(
                EMPLOYEE_ID, "ANNUAL", 2026,
                BigDecimal.valueOf(21), BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.valueOf(21), false);
    }

    private LeavePolicyResponse minimalPolicyResponse() {
        return new LeavePolicyResponse(
                UUID.randomUUID(), "ANNUAL", 21, 5, true, false, 0, null);
    }
}
