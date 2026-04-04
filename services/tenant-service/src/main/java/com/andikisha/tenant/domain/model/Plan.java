package com.andikisha.tenant.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.domain.Money;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "plans")
public class Plan extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanTier tier;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount", column = @Column(name = "monthly_price_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "monthly_price_currency"))
    })
    private Money monthlyPrice;

    @Column(name = "max_employees", nullable = false)
    private int maxEmployees;

    @Column(name = "max_admins", nullable = false)
    private int maxAdmins;

    @Column(name = "payroll_enabled", nullable = false)
    private boolean payrollEnabled;

    @Column(name = "leave_enabled", nullable = false)
    private boolean leaveEnabled;

    @Column(name = "attendance_enabled", nullable = false)
    private boolean attendanceEnabled;

    @Column(name = "documents_enabled", nullable = false)
    private boolean documentsEnabled;

    @Column(name = "analytics_enabled", nullable = false)
    private boolean analyticsEnabled;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected Plan() {}

    public String getName() { return name; }
    public PlanTier getTier() { return tier; }
    public Money getMonthlyPrice() { return monthlyPrice; }
    public int getMaxEmployees() { return maxEmployees; }
    public int getMaxAdmins() { return maxAdmins; }
    public boolean isPayrollEnabled() { return payrollEnabled; }
    public boolean isLeaveEnabled() { return leaveEnabled; }
    public boolean isAttendanceEnabled() { return attendanceEnabled; }
    public boolean isDocumentsEnabled() { return documentsEnabled; }
    public boolean isAnalyticsEnabled() { return analyticsEnabled; }
    public boolean isActive() { return active; }
}