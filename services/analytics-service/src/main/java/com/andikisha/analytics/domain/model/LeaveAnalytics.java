package com.andikisha.analytics.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "leave_analytics",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "period", "leave_type"}))
public class LeaveAnalytics extends BaseEntity {

    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "leave_type", nullable = false, length = 20)
    private String leaveType;

    @Column(name = "requests_submitted", nullable = false)
    private int requestsSubmitted;

    @Column(name = "requests_approved", nullable = false)
    private int requestsApproved;

    @Column(name = "requests_rejected", nullable = false)
    private int requestsRejected;

    @Column(name = "total_days_taken", precision = 8, scale = 1, nullable = false)
    private BigDecimal totalDaysTaken;

    @Column(name = "unique_employees", nullable = false)
    private int uniqueEmployees;

    @Column(name = "average_days_per_request", precision = 5, scale = 1, nullable = false)
    private BigDecimal averageDaysPerRequest;

    protected LeaveAnalytics() {}

    public static LeaveAnalytics create(String tenantId, String period, String leaveType) {
        LeaveAnalytics la = new LeaveAnalytics();
        la.setTenantId(tenantId);
        la.period = period;
        la.leaveType = leaveType;
        la.requestsSubmitted = 0;
        la.requestsApproved = 0;
        la.requestsRejected = 0;
        la.totalDaysTaken = BigDecimal.ZERO.setScale(1);
        la.uniqueEmployees = 0;
        la.averageDaysPerRequest = BigDecimal.ZERO.setScale(1);
        return la;
    }

    public void recordApproval(BigDecimal days) {
        this.requestsApproved++;
        this.totalDaysTaken = this.totalDaysTaken.add(days);
        recalculateAverage();
    }

    public void recordRejection() {
        this.requestsRejected++;
    }

    public void recordSubmission() {
        this.requestsSubmitted++;
    }

    public void setUniqueEmployees(int count) {
        this.uniqueEmployees = count;
    }

    private void recalculateAverage() {
        if (requestsApproved > 0) {
            this.averageDaysPerRequest = this.totalDaysTaken.divide(
                    BigDecimal.valueOf(requestsApproved), 1, RoundingMode.HALF_UP);
        }
    }

    public String getPeriod() { return period; }
    public String getLeaveType() { return leaveType; }
    public int getRequestsSubmitted() { return requestsSubmitted; }
    public int getRequestsApproved() { return requestsApproved; }
    public int getRequestsRejected() { return requestsRejected; }
    public BigDecimal getTotalDaysTaken() { return totalDaysTaken; }
    public int getUniqueEmployees() { return uniqueEmployees; }
    public BigDecimal getAverageDaysPerRequest() { return averageDaysPerRequest; }
    public BigDecimal getApprovalRate() {
        int total = requestsApproved + requestsRejected;
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(requestsApproved)
                .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
