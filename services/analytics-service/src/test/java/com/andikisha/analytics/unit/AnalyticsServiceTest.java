package com.andikisha.analytics.unit;

import com.andikisha.analytics.application.dto.response.DashboardResponse;
import com.andikisha.analytics.application.service.AnalyticsService;
import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.model.PayrollSummary;
import com.andikisha.analytics.domain.repository.AttendanceAnalyticsRepository;
import com.andikisha.analytics.domain.repository.HeadcountSnapshotRepository;
import com.andikisha.analytics.domain.repository.LeaveAnalyticsRepository;
import com.andikisha.analytics.domain.repository.PayrollSummaryRepository;
import com.andikisha.common.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock private PayrollSummaryRepository payrollRepository;
    @Mock private HeadcountSnapshotRepository headcountRepository;
    @Mock private LeaveAnalyticsRepository leaveRepository;
    @Mock private AttendanceAnalyticsRepository attendanceRepository;

    @InjectMocks private AnalyticsService analyticsService;

    private static final String TENANT = "tenant-a";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getDashboard_withFullData_returnsCompleteResponse() {
        HeadcountSnapshot headcount = HeadcountSnapshot.create(TENANT, LocalDate.now());
        headcount.setTotalActive(10);
        headcount.setTotalOnProbation(2);
        headcount.incrementNewHires();
        headcount.incrementExits();
        headcount.incrementByType("PERMANENT");
        headcount.incrementByType("CONTRACT");

        PayrollSummary payroll = PayrollSummary.create(
                TENANT, "2026-04", 12,
                new BigDecimal("1200000.00"), new BigDecimal("960000.00"),
                new BigDecimal("180000.00"), new BigDecimal("12000.00"),
                new BigDecimal("33000.00"), new BigDecimal("18000.00"),
                "run-1", "admin"
        );

        LeaveAnalytics leave = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");
        leave.recordSubmission();
        leave.recordApproval(new BigDecimal("5.0"));

        AttendanceAnalytics attendance = AttendanceAnalytics.create(TENANT, "2026-04");
        attendance.recordClockIn();
        attendance.addHours(new BigDecimal("8.00"), new BigDecimal("2.00"));

        when(headcountRepository.findLatest(TENANT)).thenReturn(Optional.of(headcount));
        when(payrollRepository.findByTenantIdOrderByPeriodDesc(TENANT)).thenReturn(List.of(payroll));
        when(leaveRepository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT, YearMonth.now().toString()))
                .thenReturn(List.of(leave));
        when(attendanceRepository.findByTenantIdAndPeriod(TENANT, YearMonth.now().toString()))
                .thenReturn(Optional.of(attendance));

        DashboardResponse response = analyticsService.getDashboard();

        assertThat(response).isNotNull();
        assertThat(response.headcount().totalHeadcount()).isEqualTo(12);
        assertThat(response.headcount().totalActive()).isEqualTo(10);
        assertThat(response.headcount().newHiresThisMonth()).isEqualTo(1);
        assertThat(response.headcount().exitsThisMonth()).isEqualTo(1);
        assertThat(response.headcount().permanent()).isEqualTo(1);
        assertThat(response.headcount().contract()).isEqualTo(1);

        assertThat(response.payrollCost().latestPeriod()).isEqualTo("2026-04");
        assertThat(response.payrollCost().totalGross()).isEqualTo(new BigDecimal("1200000.00"));
        assertThat(response.payrollCost().totalNet()).isEqualTo(new BigDecimal("960000.00"));
        assertThat(response.payrollCost().totalStatutory()).isEqualTo(new BigDecimal("243000.00"));
        assertThat(response.payrollCost().employeeCount()).isEqualTo(12);

        assertThat(response.leave().approvedThisMonth()).isEqualTo(1);
        assertThat(response.leave().rejectedThisMonth()).isZero();
        assertThat(response.leave().totalDaysTakenThisMonth()).isEqualTo(new BigDecimal("5.0"));
        assertThat(response.leave().pendingRequests()).isZero();

        assertThat(response.attendance().clockInsToday()).isEqualTo(1);
        assertThat(response.attendance().totalOvertimeThisMonth()).isEqualTo(new BigDecimal("2.00"));
        assertThat(response.attendance().absentDaysThisMonth()).isZero();
    }

    @Test
    void getDashboard_withEmptyData_returnsDefaults() {
        when(headcountRepository.findLatest(TENANT)).thenReturn(Optional.empty());
        when(payrollRepository.findByTenantIdOrderByPeriodDesc(TENANT)).thenReturn(List.of());
        when(leaveRepository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT, YearMonth.now().toString()))
                .thenReturn(List.of());
        when(attendanceRepository.findByTenantIdAndPeriod(TENANT, YearMonth.now().toString()))
                .thenReturn(Optional.empty());

        DashboardResponse response = analyticsService.getDashboard();

        assertThat(response.headcount().totalHeadcount()).isZero();
        assertThat(response.payrollCost().totalGross()).isEqualTo(BigDecimal.ZERO);
        assertThat(response.payrollCost().employeeCount()).isZero();
        assertThat(response.leave().pendingRequests()).isZero();
        assertThat(response.attendance().clockInsToday()).isZero();
    }

    @Test
    void getDashboard_leavePendingIsCalculatedCorrectly() {
        LeaveAnalytics annual = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");
        annual.recordSubmission();
        annual.recordSubmission();
        annual.recordSubmission();
        annual.recordApproval(new BigDecimal("5.0"));
        annual.recordRejection();

        LeaveAnalytics sick = LeaveAnalytics.create(TENANT, "2026-04", "SICK");
        sick.recordSubmission();
        sick.recordSubmission();
        sick.recordApproval(new BigDecimal("3.0"));

        when(headcountRepository.findLatest(TENANT)).thenReturn(Optional.empty());
        when(payrollRepository.findByTenantIdOrderByPeriodDesc(TENANT)).thenReturn(List.of());
        when(leaveRepository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT, YearMonth.now().toString()))
                .thenReturn(List.of(annual, sick));
        when(attendanceRepository.findByTenantIdAndPeriod(TENANT, YearMonth.now().toString()))
                .thenReturn(Optional.empty());

        DashboardResponse response = analyticsService.getDashboard();

        assertThat(response.leave().approvedThisMonth()).isEqualTo(2);
        assertThat(response.leave().rejectedThisMonth()).isEqualTo(1);
        assertThat(response.leave().pendingRequests()).isEqualTo(2);
        assertThat(response.leave().totalDaysTakenThisMonth()).isEqualTo(new BigDecimal("8.0"));
    }

    @Test
    void getDashboard_leavePendingNeverNegative() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");
        la.recordSubmission();
        la.recordApproval(new BigDecimal("2.0"));
        la.recordApproval(new BigDecimal("3.0"));

        when(headcountRepository.findLatest(TENANT)).thenReturn(Optional.empty());
        when(payrollRepository.findByTenantIdOrderByPeriodDesc(TENANT)).thenReturn(List.of());
        when(leaveRepository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT, YearMonth.now().toString()))
                .thenReturn(List.of(la));
        when(attendanceRepository.findByTenantIdAndPeriod(TENANT, YearMonth.now().toString()))
                .thenReturn(Optional.empty());

        DashboardResponse response = analyticsService.getDashboard();

        assertThat(response.leave().pendingRequests()).isZero();
    }

    @Test
    void getPayrollTrend_returnsRepositoryResults() {
        PayrollSummary p1 = PayrollSummary.create(
                TENANT, "2026-01", 10, new BigDecimal("1000000"), new BigDecimal("800000"),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                "r1", "admin");
        PayrollSummary p2 = PayrollSummary.create(
                TENANT, "2026-02", 11, new BigDecimal("1100000"), new BigDecimal("880000"),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                "r2", "admin");

        when(payrollRepository.findByTenantIdAndPeriodRange(TENANT, "2026-01", "2026-02"))
                .thenReturn(List.of(p1, p2));

        List<PayrollSummary> result = analyticsService.getPayrollTrend("2026-01", "2026-02");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPeriod()).isEqualTo("2026-01");
        assertThat(result.get(1).getPeriod()).isEqualTo("2026-02");
    }

    @Test
    void getHeadcountTrend_returnsRepositoryResults() {
        HeadcountSnapshot h1 = HeadcountSnapshot.create(TENANT, LocalDate.of(2026, 1, 1));
        HeadcountSnapshot h2 = HeadcountSnapshot.create(TENANT, LocalDate.of(2026, 2, 1));

        when(headcountRepository.findByTenantIdAndDateRange(TENANT,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1)))
                .thenReturn(List.of(h1, h2));

        List<HeadcountSnapshot> result = analyticsService.getHeadcountTrend(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1));

        assertThat(result).hasSize(2);
    }

    @Test
    void getLeaveBreakdown_returnsRepositoryResults() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");

        when(leaveRepository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(TENANT, "2026-04"))
                .thenReturn(List.of(la));

        List<LeaveAnalytics> result = analyticsService.getLeaveBreakdown("2026-04");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLeaveType()).isEqualTo("ANNUAL");
    }

    @Test
    void getLeaveTrend_returnsRepositoryResults() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, "2026-04", "SICK");

        when(leaveRepository.findByTenantIdAndLeaveTypeOrderByPeriodDesc(TENANT, "SICK"))
                .thenReturn(List.of(la));

        List<LeaveAnalytics> result = analyticsService.getLeaveTrend("SICK");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLeaveType()).isEqualTo("SICK");
    }
}
