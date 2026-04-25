package com.andikisha.analytics.e2e;

import com.andikisha.analytics.application.dto.response.DashboardResponse;
import com.andikisha.analytics.application.service.AnalyticsService;
import com.andikisha.analytics.infrastructure.config.WebMvcConfig;
import com.andikisha.analytics.presentation.controller.DashboardController;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import({GlobalExceptionHandler.class, WebMvcConfig.class})
class DashboardControllerTest {

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
    void dashboard_missingTenantHeader_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void dashboard_withTenantHeader_returns200() throws Exception {
        DashboardResponse response = new DashboardResponse(
                new DashboardResponse.HeadcountSummary(12, 10, 2, 1, 0, 8, 3, 1),
                new DashboardResponse.PayrollCostSummary(
                        "2026-04", new BigDecimal("1200000"), new BigDecimal("960000"),
                        new BigDecimal("243000"), new BigDecimal("100000"), 12, "KES"),
                new DashboardResponse.LeaveSummary(0, 5, 1, new BigDecimal("25.0")),
                new DashboardResponse.AttendanceSummary(10, new BigDecimal("15.50"), 2)
        );

        when(analyticsService.getDashboard()).thenReturn(response);

        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headcount.totalHeadcount").value(12))
                .andExpect(jsonPath("$.headcount.totalActive").value(10))
                .andExpect(jsonPath("$.headcount.newHiresThisMonth").value(1))
                .andExpect(jsonPath("$.headcount.exitsThisMonth").value(0))
                .andExpect(jsonPath("$.headcount.permanent").value(8))
                .andExpect(jsonPath("$.payrollCost.latestPeriod").value("2026-04"))
                .andExpect(jsonPath("$.payrollCost.totalGross").value(1200000))
                .andExpect(jsonPath("$.payrollCost.totalNet").value(960000))
                .andExpect(jsonPath("$.payrollCost.employeeCount").value(12))
                .andExpect(jsonPath("$.payrollCost.currency").value("KES"))
                .andExpect(jsonPath("$.leave.approvedThisMonth").value(5))
                .andExpect(jsonPath("$.leave.rejectedThisMonth").value(1))
                .andExpect(jsonPath("$.leave.totalDaysTakenThisMonth").value(25.0))
                .andExpect(jsonPath("$.attendance.clockInsToday").value(10))
                .andExpect(jsonPath("$.attendance.absentDaysThisMonth").value(2));
    }

    @Test
    void dashboard_withEmptyData_returnsDefaults() throws Exception {
        DashboardResponse response = new DashboardResponse(
                new DashboardResponse.HeadcountSummary(0, 0, 0, 0, 0, 0, 0, 0),
                new DashboardResponse.PayrollCostSummary(
                        null, BigDecimal.ZERO, BigDecimal.ZERO,
                        BigDecimal.ZERO, BigDecimal.ZERO, 0, "KES"),
                new DashboardResponse.LeaveSummary(0, 0, 0, BigDecimal.ZERO),
                new DashboardResponse.AttendanceSummary(0, BigDecimal.ZERO, 0)
        );

        when(analyticsService.getDashboard()).thenReturn(response);

        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .header("X-Tenant-ID", TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headcount.totalHeadcount").value(0))
                .andExpect(jsonPath("$.payrollCost.totalGross").value(0))
                .andExpect(jsonPath("$.leave.approvedThisMonth").value(0))
                .andExpect(jsonPath("$.attendance.clockInsToday").value(0));
    }
}
