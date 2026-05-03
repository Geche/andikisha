package com.andikisha.leave.application.mapper;

import com.andikisha.leave.application.dto.response.LeaveBalanceResponse;
import com.andikisha.leave.application.dto.response.LeavePolicyResponse;
import com.andikisha.leave.application.dto.response.LeaveRequestResponse;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T01:54:45+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class LeaveMapperImpl implements LeaveMapper {

    @Override
    public LeaveRequestResponse toResponse(LeaveRequest r) {
        if ( r == null ) {
            return null;
        }

        UUID id = null;
        UUID employeeId = null;
        String employeeName = null;
        LocalDate startDate = null;
        LocalDate endDate = null;
        BigDecimal days = null;
        String reason = null;
        UUID reviewedBy = null;
        String reviewerName = null;
        LocalDateTime reviewedAt = null;
        String rejectionReason = null;
        boolean hasMedicalCert = false;
        LocalDateTime createdAt = null;

        id = r.getId();
        employeeId = r.getEmployeeId();
        employeeName = r.getEmployeeName();
        startDate = r.getStartDate();
        endDate = r.getEndDate();
        days = r.getDays();
        reason = r.getReason();
        reviewedBy = r.getReviewedBy();
        reviewerName = r.getReviewerName();
        reviewedAt = r.getReviewedAt();
        rejectionReason = r.getRejectionReason();
        hasMedicalCert = r.isHasMedicalCert();
        createdAt = r.getCreatedAt();

        String leaveType = r.getLeaveType().name();
        String status = r.getStatus().name();

        LeaveRequestResponse leaveRequestResponse = new LeaveRequestResponse( id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status, reviewedBy, reviewerName, reviewedAt, rejectionReason, hasMedicalCert, createdAt );

        return leaveRequestResponse;
    }

    @Override
    public LeaveBalanceResponse toResponse(LeaveBalance b) {
        if ( b == null ) {
            return null;
        }

        UUID employeeId = null;
        int year = 0;
        BigDecimal accrued = null;
        BigDecimal used = null;
        BigDecimal carriedOver = null;
        boolean frozen = false;

        employeeId = b.getEmployeeId();
        year = b.getYear();
        accrued = b.getAccrued();
        used = b.getUsed();
        carriedOver = b.getCarriedOver();
        frozen = b.isFrozen();

        String leaveType = b.getLeaveType().name();
        BigDecimal available = b.getAvailable();

        LeaveBalanceResponse leaveBalanceResponse = new LeaveBalanceResponse( employeeId, leaveType, year, accrued, used, carriedOver, available, frozen );

        return leaveBalanceResponse;
    }

    @Override
    public LeavePolicyResponse toResponse(LeavePolicy p) {
        if ( p == null ) {
            return null;
        }

        UUID id = null;
        int daysPerYear = 0;
        int carryOverMax = 0;
        boolean requiresApproval = false;
        boolean requiresMedicalCert = false;
        int minDaysNotice = 0;
        Integer maxConsecutiveDays = null;

        id = p.getId();
        daysPerYear = p.getDaysPerYear();
        carryOverMax = p.getCarryOverMax();
        requiresApproval = p.isRequiresApproval();
        requiresMedicalCert = p.isRequiresMedicalCert();
        minDaysNotice = p.getMinDaysNotice();
        maxConsecutiveDays = p.getMaxConsecutiveDays();

        String leaveType = p.getLeaveType().name();

        LeavePolicyResponse leavePolicyResponse = new LeavePolicyResponse( id, leaveType, daysPerYear, carryOverMax, requiresApproval, requiresMedicalCert, minDaysNotice, maxConsecutiveDays );

        return leavePolicyResponse;
    }
}
