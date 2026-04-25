package com.andikisha.analytics.application.service;

import com.andikisha.analytics.application.dto.response.DashboardResponse;
import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.model.PayrollSummary;
import com.andikisha.analytics.domain.repository.AttendanceAnalyticsRepository;
import com.andikisha.analytics.domain.repository.HeadcountSnapshotRepository;
import com.andikisha.analytics.domain.repository.LeaveAnalyticsRepository;
import com.andikisha.analytics.domain.repository.PayrollSummaryRepository;
import com.andikisha.common.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final PayrollSummaryRepository payrollRepository;
    private final HeadcountSnapshotRepository headcountRepository;
    private final LeaveAnalyticsRepository leaveRepository;
    private final AttendanceAnalyticsRepository attendanceRepository;

    public AnalyticsService(PayrollSummaryRepository payrollRepository,
                            HeadcountSnapshotRepository headcountRepository,
                            LeaveAnalyticsRepository leaveRepository,
                            AttendanceAnalyticsRepository attendanceRepository) {
        this.payrollRepository = payrollRepository;
        this.headcountRepository = headcountRepository;
        this.leaveRepository = leaveRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public DashboardResponse getDashboard() {
        String tenantId = TenantContext.requireTenantId();
        String currentPeriod = YearMonth.now().toString();

        return new DashboardResponse(
                buildHeadcount(tenantId),
                buildPayrollCost(tenantId),
                buildLeaveSummary(tenantId, currentPeriod),
                buildAttendanceSummary(tenantId, currentPeriod)
        );
    }

    public List<PayrollSummary> getPayrollTrend(String fromPeriod, String toPeriod) {
        String tenantId = TenantContext.requireTenantId();
        return payrollRepository.findByTenantIdAndPeriodRange(
                tenantId, fromPeriod, toPeriod);
    }

    public List<HeadcountSnapshot> getHeadcountTrend(LocalDate from, LocalDate to) {
        String tenantId = TenantContext.requireTenantId();
        return headcountRepository.findByTenantIdAndDateRange(tenantId, from, to);
    }

    public List<LeaveAnalytics> getLeaveBreakdown(String period) {
        String tenantId = TenantContext.requireTenantId();
        return leaveRepository.findByTenantIdAndPeriodOrderByLeaveTypeAsc(
                tenantId, period);
    }

    public List<LeaveAnalytics> getLeaveTrend(String leaveType) {
        String tenantId = TenantContext.requireTenantId();
        return leaveRepository.findByTenantIdAndLeaveTypeOrderByPeriodDesc(
                tenantId, leaveType);
    }

    private DashboardResponse.HeadcountSummary buildHeadcount(String tenantId) {
        return headcountRepository.findLatest(tenantId)
                .map(h -> new DashboardResponse.HeadcountSummary(
                        h.getTotalHeadcount(), h.getTotalActive(), h.getTotalOnProbation(),
                        h.getNewHires(), h.getExits(),
                        h.getPermanentCount(), h.getContractCount(), h.getCasualCount()))
                .orElse(new DashboardResponse.HeadcountSummary(0, 0, 0, 0, 0, 0, 0, 0));
    }

    private DashboardResponse.PayrollCostSummary buildPayrollCost(String tenantId) {
        List<PayrollSummary> recent = payrollRepository
                .findByTenantIdOrderByPeriodDesc(tenantId);

        if (recent.isEmpty()) {
            return new DashboardResponse.PayrollCostSummary(
                    null, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO, 0, "KES");
        }

        PayrollSummary latest = recent.get(0);
        BigDecimal totalStatutory = latest.getTotalPaye()
                .add(latest.getTotalNssf())
                .add(latest.getTotalShif())
                .add(latest.getTotalHousingLevy());

        return new DashboardResponse.PayrollCostSummary(
                latest.getPeriod(), latest.getTotalGross(), latest.getTotalNet(),
                totalStatutory, latest.getAverageGross(),
                latest.getEmployeeCount(), latest.getCurrency());
    }

    private DashboardResponse.LeaveSummary buildLeaveSummary(String tenantId,
                                                             String period) {
        List<LeaveAnalytics> analytics = leaveRepository
                .findByTenantIdAndPeriodOrderByLeaveTypeAsc(tenantId, period);

        int approved = analytics.stream().mapToInt(LeaveAnalytics::getRequestsApproved).sum();
        int rejected = analytics.stream().mapToInt(LeaveAnalytics::getRequestsRejected).sum();
        BigDecimal daysTaken = analytics.stream()
                .map(LeaveAnalytics::getTotalDaysTaken)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int submitted = analytics.stream().mapToInt(LeaveAnalytics::getRequestsSubmitted).sum();
        int pending = submitted - approved - rejected;

        return new DashboardResponse.LeaveSummary(
                Math.max(0, pending), approved, rejected, daysTaken);
    }

    private DashboardResponse.AttendanceSummary buildAttendanceSummary(String tenantId,
                                                                       String period) {
        return attendanceRepository.findByTenantIdAndPeriod(tenantId, period)
                .map(a -> new DashboardResponse.AttendanceSummary(
                        a.getTotalClockIns(), a.getTotalOvertimeHours(), a.getAbsentDays()))
                .orElse(new DashboardResponse.AttendanceSummary(
                        0, BigDecimal.ZERO, 0));
    }
}