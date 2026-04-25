package com.andikisha.analytics.e2e;

import com.andikisha.analytics.application.service.AnalyticsService;
import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.model.PayrollSummary;
import com.andikisha.analytics.infrastructure.config.WebMvcConfig;
import com.andikisha.analytics.presentation.controller.ReportsController;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.andikisha.common.tenant.TenantContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportsController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class})
class ReportsControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean AnalyticsService analyticsService;

    // @EnableJpaAuditing requires this mock in @WebMvcTest
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String TENANT = "e2e-tenant";
    private static final String USER_ID = "admin-user";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void payrollTrend_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/reports/payroll-trend")
                        .param("fromPeriod", "2026-01")
                        .param("toPeriod", "2026-03"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void payrollTrend_withParams_returns200() throws Exception {
        PayrollSummary p1 = PayrollSummary.create(
                TENANT, "2026-01", 10, new BigDecimal("1000000"), new BigDecimal("800000"),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                "r1", "admin");
        PayrollSummary p2 = PayrollSummary.create(
                TENANT, "2026-02", 11, new BigDecimal("1100000"), new BigDecimal("880000"),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                "r2", "admin");

        when(analyticsService.getPayrollTrend("2026-01", "2026-02"))
                .thenReturn(List.of(p1, p2));

        mockMvc.perform(get("/api/v1/analytics/reports/payroll-trend")
                        .header("X-Tenant-ID", TENANT)
                        .param("fromPeriod", "2026-01")
                        .param("toPeriod", "2026-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].period").value("2026-01"))
                .andExpect(jsonPath("$[0].employeeCount").value(10))
                .andExpect(jsonPath("$[1].period").value("2026-02"))
                .andExpect(jsonPath("$[1].employeeCount").value(11));
    }

    @Test
    void headcountTrend_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/reports/headcount-trend")
                        .param("from", "2026-01-01")
                        .param("to", "2026-03-31"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void headcountTrend_withParams_returns200() throws Exception {
        HeadcountSnapshot h1 = HeadcountSnapshot.create(TENANT, LocalDate.of(2026, 1, 1));
        h1.setTotalActive(10);
        HeadcountSnapshot h2 = HeadcountSnapshot.create(TENANT, LocalDate.of(2026, 2, 1));
        h2.setTotalActive(11);

        when(analyticsService.getHeadcountTrend(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1)))
                .thenReturn(List.of(h1, h2));

        mockMvc.perform(get("/api/v1/analytics/reports/headcount-trend")
                        .header("X-Tenant-ID", TENANT)
                        .param("from", "2026-01-01")
                        .param("to", "2026-02-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totalActive").value(10))
                .andExpect(jsonPath("$[1].totalActive").value(11));
    }

    @Test
    void leaveBreakdown_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/reports/leave-breakdown/2026-04"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void leaveBreakdown_withPeriod_returns200() throws Exception {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");
        la.recordApproval(new BigDecimal("5.0"));

        when(analyticsService.getLeaveBreakdown("2026-04"))
                .thenReturn(List.of(la));

        mockMvc.perform(get("/api/v1/analytics/reports/leave-breakdown/2026-04")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].leaveType").value("ANNUAL"))
                .andExpect(jsonPath("$[0].requestsApproved").value(1))
                .andExpect(jsonPath("$[0].totalDaysTaken").value(5.0));
    }

    @Test
    void leaveTrend_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/reports/leave-trend/ANNUAL"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void leaveTrend_withLeaveType_returns200() throws Exception {
        LeaveAnalytics la1 = LeaveAnalytics.create(TENANT, "2026-03", "ANNUAL");
        LeaveAnalytics la2 = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");

        when(analyticsService.getLeaveTrend("ANNUAL"))
                .thenReturn(List.of(la2, la1));

        mockMvc.perform(get("/api/v1/analytics/reports/leave-trend/ANNUAL")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].period").value("2026-04"))
                .andExpect(jsonPath("$[1].period").value("2026-03"));
    }

    @Test
    void payrollTrend_emptyResult_returns200() throws Exception {
        when(analyticsService.getPayrollTrend("2026-01", "2026-02"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/analytics/reports/payroll-trend")
                        .header("X-Tenant-ID", TENANT)
                        .param("fromPeriod", "2026-01")
                        .param("toPeriod", "2026-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void headcountTrend_emptyResult_returns200() throws Exception {
        when(analyticsService.getHeadcountTrend(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/analytics/reports/headcount-trend")
                        .header("X-Tenant-ID", TENANT)
                        .param("from", "2026-01-01")
                        .param("to", "2026-02-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void leaveBreakdown_emptyResult_returns200() throws Exception {
        when(analyticsService.getLeaveBreakdown("2026-04"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/analytics/reports/leave-breakdown/2026-04")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void leaveTrend_emptyResult_returns200() throws Exception {
        when(analyticsService.getLeaveTrend("ANNUAL"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/analytics/reports/leave-trend/ANNUAL")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
