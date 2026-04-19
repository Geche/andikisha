package com.andikisha.attendance.e2e;

import com.andikisha.attendance.application.dto.response.AttendanceResponse;
import com.andikisha.attendance.application.dto.response.MonthlySummaryResponse;
import com.andikisha.attendance.application.service.AttendanceService;
import com.andikisha.attendance.infrastructure.config.WebMvcConfig;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.attendance.presentation.controller.AttendanceController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AttendanceController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class})
class AttendanceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean AttendanceService attendanceService;
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT_ID   = "e2e-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();

    // -------------------------------------------------------------------------
    // POST /api/v1/attendance/clock-in
    // -------------------------------------------------------------------------

    @Test
    void clockIn_missingTenantHeader_returns400() throws Exception {
        // TenantInterceptor rejects requests without X-Tenant-ID
        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"clockInTime":"2024-04-15T08:00:00"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void clockIn_missingClockInTime_returns400WithValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void clockIn_happyPath_returns201WithResponse() throws Exception {
        AttendanceResponse response = stubAttendanceResponse();
        when(attendanceService.clockIn(eq(EMPLOYEE_ID), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"clockInTime":"2024-04-15T08:00:00","source":"WEB"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value(EMPLOYEE_ID.toString()));
    }

    @Test
    void clockIn_whenAlreadyClockedIn_returns422() throws Exception {
        when(attendanceService.clockIn(any(), any()))
                .thenThrow(new BusinessRuleException("ALREADY_CLOCKED_IN", "Already clocked in for today"));

        mockMvc.perform(post("/api/v1/attendance/clock-in")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"clockInTime":"2024-04-15T08:00:00"}
                                """))
                .andExpect(status().isUnprocessableEntity());
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/attendance/clock-out
    // -------------------------------------------------------------------------

    @Test
    void clockOut_missingClockOutTime_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/attendance/clock-out")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void clockOut_happyPath_returns200() throws Exception {
        AttendanceResponse response = stubAttendanceResponse();
        when(attendanceService.clockOut(eq(EMPLOYEE_ID), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/attendance/clock-out")
                        .header("X-Tenant-ID", TENANT_ID)
                        .header("X-Employee-ID", EMPLOYEE_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"clockOutTime":"2024-04-15T17:00:00","source":"WEB"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(EMPLOYEE_ID.toString()));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/attendance/employees/{employeeId}
    // -------------------------------------------------------------------------

    @Test
    void getEmployeeAttendance_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/employees/{id}", EMPLOYEE_ID))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getEmployeeAttendance_happyPath_returns200WithPage() throws Exception {
        when(attendanceService.getEmployeeAttendance(eq(EMPLOYEE_ID), any()))
                .thenReturn(new PageImpl<>(List.of(stubAttendanceResponse()), PageRequest.of(0, 25), 1));

        mockMvc.perform(get("/api/v1/attendance/employees/{id}", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/attendance/employees/{employeeId}/monthly-summary
    // -------------------------------------------------------------------------

    @Test
    void getMonthlySummary_happyPath_returns200() throws Exception {
        MonthlySummaryResponse response = stubSummaryResponse();
        when(attendanceService.getMonthlySummary(eq(EMPLOYEE_ID), eq("2024-04"))).thenReturn(response);

        mockMvc.perform(get("/api/v1/attendance/employees/{id}/monthly-summary", EMPLOYEE_ID)
                        .header("X-Tenant-ID", TENANT_ID)
                        .param("period", "2024-04"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("2024-04"));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private AttendanceResponse stubAttendanceResponse() {
        return new AttendanceResponse(UUID.randomUUID(), EMPLOYEE_ID,
                LocalDate.of(2024, 4, 15),
                LocalDateTime.of(2024, 4, 15, 8, 0), null,
                "WEB", null,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                false, null, false, false, false, false, null, false);
    }

    private MonthlySummaryResponse stubSummaryResponse() {
        return new MonthlySummaryResponse(EMPLOYEE_ID, "2024-04",
                18, 2, 2, 1,
                new BigDecimal("164.00"), new BigDecimal("144.00"),
                new BigDecimal("4.00"), new BigDecimal("8.00"), new BigDecimal("8.00"),
                3, 1);
    }
}
