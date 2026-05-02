package com.andikisha.leave.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

@Getter
@Entity
@Table(name = "leave_policies",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "leave_type"}))
public class LeavePolicy extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 20)
    private LeaveType leaveType;

    @Column(name = "days_per_year", nullable = false)
    private int daysPerYear;

    @Column(name = "carry_over_max", nullable = false)
    private int carryOverMax;

    @Column(name = "requires_approval", nullable = false)
    private boolean requiresApproval = true;

    @Column(name = "requires_medical_cert", nullable = false)
    private boolean requiresMedicalCert = false;

    @Column(name = "min_days_notice", nullable = false)
    private int minDaysNotice = 0;

    @Column(name = "max_consecutive_days")
    private Integer maxConsecutiveDays;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected LeavePolicy() {}

    public static LeavePolicy create(String tenantId, LeaveType leaveType,
                                     int daysPerYear, int carryOverMax,
                                     boolean requiresApproval,
                                     boolean requiresMedicalCert) {
        validateMinimumDays(leaveType, daysPerYear);
        LeavePolicy policy = new LeavePolicy();
        policy.setTenantId(tenantId);
        policy.leaveType = leaveType;
        policy.daysPerYear = daysPerYear;
        policy.carryOverMax = carryOverMax;
        policy.requiresApproval = requiresApproval;
        policy.requiresMedicalCert = requiresMedicalCert;
        return policy;
    }

    private static void validateMinimumDays(LeaveType type, int days) {
        int minimum = switch (type) {
            case ANNUAL    -> 21;
            case SICK      -> 30;
            case MATERNITY -> 90;
            case PATERNITY -> 14;
            default        -> 0;
        };
        if (days < minimum) {
            throw new IllegalArgumentException(
                    type.name() + " leave must provide at least " + minimum +
                    " days per the Kenyan Employment Act Cap 226. Provided: " + days);
        }
    }

    public void update(int daysPerYear, int carryOverMax,
                       boolean requiresApproval, boolean requiresMedicalCert,
                       int minDaysNotice, Integer maxConsecutiveDays) {
        this.daysPerYear = daysPerYear;
        this.carryOverMax = carryOverMax;
        this.requiresApproval = requiresApproval;
        this.requiresMedicalCert = requiresMedicalCert;
        this.minDaysNotice = minDaysNotice;
        this.maxConsecutiveDays = maxConsecutiveDays;
    }

}