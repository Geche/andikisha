package com.andikisha.leave.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Entity
@Table(name = "leave_requests")
public class LeaveRequest extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "employee_name", nullable = false, length = 200)
    private String employeeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal days;

    @Column(length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveRequestStatus status;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewer_name", length = 200)
    private String reviewerName;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "has_medical_cert", nullable = false)
    private boolean hasMedicalCert = false;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    protected LeaveRequest() {}

    public static LeaveRequest create(String tenantId, UUID employeeId,
                                      String employeeName, LeaveType leaveType,
                                      LocalDate startDate, LocalDate endDate,
                                      BigDecimal days, String reason) {
        if (startDate.isAfter(endDate)) {
            throw new BusinessRuleException("Start date cannot be after end date");
        }
        if (days.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Leave days must be positive");
        }

        LeaveRequest request = new LeaveRequest();
        request.setTenantId(tenantId);
        request.employeeId = employeeId;
        request.employeeName = employeeName;
        request.leaveType = leaveType;
        request.startDate = startDate;
        request.endDate = endDate;
        request.days = days;
        request.reason = reason;
        request.status = LeaveRequestStatus.PENDING;
        return request;
    }

    public void approve(UUID reviewedBy, String reviewerName) {
        if (this.status != LeaveRequestStatus.PENDING) {
            throw new BusinessRuleException("Can only approve a PENDING leave request");
        }
        this.status = LeaveRequestStatus.APPROVED;
        this.reviewedBy = reviewedBy;
        this.reviewerName = reviewerName;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(UUID reviewedBy, String reviewerName, String reason) {
        if (this.status != LeaveRequestStatus.PENDING) {
            throw new BusinessRuleException("Can only reject a PENDING leave request");
        }
        this.status = LeaveRequestStatus.REJECTED;
        this.reviewedBy = reviewedBy;
        this.reviewerName = reviewerName;
        this.reviewedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }

    public void cancel() {
        if (this.status == LeaveRequestStatus.APPROVED) {
            throw new BusinessRuleException(
                    "Cannot cancel an approved leave. Contact HR to reverse it.");
        }
        if (this.status != LeaveRequestStatus.PENDING) {
            throw new BusinessRuleException("Can only cancel a PENDING leave request");
        }
        this.status = LeaveRequestStatus.CANCELLED;
    }

    /**
     * HR-only reversal of an approved leave request. Restores the employee's balance.
     * Only HR can call this — the employee-facing cancel() path blocks APPROVED leave.
     */
    public void reverse(UUID reversedBy, String reversedByName, String reason) {
        if (this.status != LeaveRequestStatus.APPROVED) {
            throw new BusinessRuleException("Cannot reverse a leave request that is not APPROVED");
        }
        this.status = LeaveRequestStatus.CANCELLED;
        this.reviewedBy = reversedBy;
        this.reviewerName = reversedByName;
        this.reviewedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }

    public void attachMedicalCert(String url) {
        this.hasMedicalCert = true;
        this.attachmentUrl = url;
    }

}