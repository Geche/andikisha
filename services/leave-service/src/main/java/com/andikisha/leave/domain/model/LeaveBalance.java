package com.andikisha.leave.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Entity
@Table(name = "leave_balances",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "employee_id", "leave_type", "year"}))
public class LeaveBalance extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private BigDecimal accrued;

    @Column(nullable = false)
    private BigDecimal used;

    @Column(name = "carried_over", nullable = false)
    private BigDecimal carriedOver;

    @Column(nullable = false)
    private boolean frozen = false;

    protected LeaveBalance() {}

    public static LeaveBalance create(String tenantId, UUID employeeId,
                                      LeaveType leaveType, int year,
                                      BigDecimal accrued, BigDecimal carriedOver) {
        LeaveBalance balance = new LeaveBalance();
        balance.setTenantId(tenantId);
        balance.employeeId = employeeId;
        balance.leaveType = leaveType;
        balance.year = year;
        balance.accrued = accrued;
        balance.used = BigDecimal.ZERO;
        balance.carriedOver = carriedOver;
        balance.frozen = false;
        return balance;
    }

    public BigDecimal getAvailable() {
        return accrued.add(carriedOver).subtract(used);
    }

    public void deduct(BigDecimal days) {
        if (frozen) {
            throw new BusinessRuleException("Leave balance is frozen for this employee");
        }
        if (days.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Deduction days must be positive");
        }
        if (days.compareTo(getAvailable()) > 0) {
            throw new BusinessRuleException(
                    "Insufficient leave balance. Available: " + getAvailable()
                            + ", Requested: " + days);
        }
        this.used = this.used.add(days);
    }

    public void restore(BigDecimal days) {
        if (days.compareTo(BigDecimal.ZERO) <= 0) return;
        this.used = this.used.subtract(days).max(BigDecimal.ZERO);
    }

    public void accrue(BigDecimal days) {
        if (frozen) return;
        this.accrued = this.accrued.add(days);
    }

    public void freeze() {
        this.frozen = true;
    }

}