package com.andikisha.analytics.application.mapper;

import com.andikisha.analytics.application.dto.response.HeadcountSnapshotResponse;
import com.andikisha.analytics.application.dto.response.LeaveAnalyticsResponse;
import com.andikisha.analytics.application.dto.response.PayrollSummaryResponse;
import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.model.PayrollSummary;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-28T09:45:40+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class AnalyticsMapperImpl implements AnalyticsMapper {

    @Override
    public PayrollSummaryResponse toResponse(PayrollSummary entity) {
        if ( entity == null ) {
            return null;
        }

        String period = null;
        int employeeCount = 0;
        BigDecimal totalGross = null;
        BigDecimal totalNet = null;
        BigDecimal totalPaye = null;
        BigDecimal totalNssf = null;
        BigDecimal totalShif = null;
        BigDecimal totalHousingLevy = null;
        BigDecimal averageGross = null;
        BigDecimal averageNet = null;
        String currency = null;
        String payrollRunId = null;
        String approvedBy = null;

        period = entity.getPeriod();
        employeeCount = entity.getEmployeeCount();
        totalGross = entity.getTotalGross();
        totalNet = entity.getTotalNet();
        totalPaye = entity.getTotalPaye();
        totalNssf = entity.getTotalNssf();
        totalShif = entity.getTotalShif();
        totalHousingLevy = entity.getTotalHousingLevy();
        averageGross = entity.getAverageGross();
        averageNet = entity.getAverageNet();
        currency = entity.getCurrency();
        payrollRunId = entity.getPayrollRunId();
        approvedBy = entity.getApprovedBy();

        PayrollSummaryResponse payrollSummaryResponse = new PayrollSummaryResponse( period, employeeCount, totalGross, totalNet, totalPaye, totalNssf, totalShif, totalHousingLevy, averageGross, averageNet, currency, payrollRunId, approvedBy );

        return payrollSummaryResponse;
    }

    @Override
    public List<PayrollSummaryResponse> toPayrollSummaryList(List<PayrollSummary> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PayrollSummaryResponse> list = new ArrayList<PayrollSummaryResponse>( entities.size() );
        for ( PayrollSummary payrollSummary : entities ) {
            list.add( toResponse( payrollSummary ) );
        }

        return list;
    }

    @Override
    public HeadcountSnapshotResponse toResponse(HeadcountSnapshot entity) {
        if ( entity == null ) {
            return null;
        }

        LocalDate snapshotDate = null;
        int totalActive = 0;
        int totalOnProbation = 0;
        int totalOnLeave = 0;
        int totalSuspended = 0;
        int totalTerminated = 0;
        int newHires = 0;
        int exits = 0;
        int permanentCount = 0;
        int contractCount = 0;
        int casualCount = 0;
        int internCount = 0;
        int totalHeadcount = 0;

        snapshotDate = entity.getSnapshotDate();
        totalActive = entity.getTotalActive();
        totalOnProbation = entity.getTotalOnProbation();
        totalOnLeave = entity.getTotalOnLeave();
        totalSuspended = entity.getTotalSuspended();
        totalTerminated = entity.getTotalTerminated();
        newHires = entity.getNewHires();
        exits = entity.getExits();
        permanentCount = entity.getPermanentCount();
        contractCount = entity.getContractCount();
        casualCount = entity.getCasualCount();
        internCount = entity.getInternCount();
        totalHeadcount = entity.getTotalHeadcount();

        HeadcountSnapshotResponse headcountSnapshotResponse = new HeadcountSnapshotResponse( snapshotDate, totalActive, totalOnProbation, totalOnLeave, totalSuspended, totalTerminated, newHires, exits, permanentCount, contractCount, casualCount, internCount, totalHeadcount );

        return headcountSnapshotResponse;
    }

    @Override
    public List<HeadcountSnapshotResponse> toHeadcountList(List<HeadcountSnapshot> entities) {
        if ( entities == null ) {
            return null;
        }

        List<HeadcountSnapshotResponse> list = new ArrayList<HeadcountSnapshotResponse>( entities.size() );
        for ( HeadcountSnapshot headcountSnapshot : entities ) {
            list.add( toResponse( headcountSnapshot ) );
        }

        return list;
    }

    @Override
    public LeaveAnalyticsResponse toResponse(LeaveAnalytics entity) {
        if ( entity == null ) {
            return null;
        }

        String period = null;
        String leaveType = null;
        int requestsSubmitted = 0;
        int requestsApproved = 0;
        int requestsRejected = 0;
        BigDecimal totalDaysTaken = null;
        int uniqueEmployees = 0;
        BigDecimal averageDaysPerRequest = null;
        BigDecimal approvalRate = null;

        period = entity.getPeriod();
        leaveType = entity.getLeaveType();
        requestsSubmitted = entity.getRequestsSubmitted();
        requestsApproved = entity.getRequestsApproved();
        requestsRejected = entity.getRequestsRejected();
        totalDaysTaken = entity.getTotalDaysTaken();
        uniqueEmployees = entity.getUniqueEmployees();
        averageDaysPerRequest = entity.getAverageDaysPerRequest();
        approvalRate = entity.getApprovalRate();

        LeaveAnalyticsResponse leaveAnalyticsResponse = new LeaveAnalyticsResponse( period, leaveType, requestsSubmitted, requestsApproved, requestsRejected, totalDaysTaken, uniqueEmployees, averageDaysPerRequest, approvalRate );

        return leaveAnalyticsResponse;
    }

    @Override
    public List<LeaveAnalyticsResponse> toLeaveList(List<LeaveAnalytics> entities) {
        if ( entities == null ) {
            return null;
        }

        List<LeaveAnalyticsResponse> list = new ArrayList<LeaveAnalyticsResponse>( entities.size() );
        for ( LeaveAnalytics leaveAnalytics : entities ) {
            list.add( toResponse( leaveAnalytics ) );
        }

        return list;
    }
}
