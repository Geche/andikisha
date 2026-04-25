package com.andikisha.analytics.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;

@Entity
@Table(name = "attendance_analytics",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "period"}))
public class AttendanceAnalytics extends BaseEntity {

    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "total_clock_ins", nullable = false)
    private int totalClockIns;

    @Column(name = "total_regular_hours", precision = 10, scale = 2)
    private BigDecimal totalRegularHours;

    @Column(name = "total_overtime_hours", precision = 10, scale = 2)
    private BigDecimal totalOvertimeHours;

    @Column(name = "average_hours_per_day", precision = 5, scale = 2)
    private BigDecimal averageHoursPerDay;

    @Column(name = "late_arrivals", nullable = false)
    private int lateArrivals;

    @Column(name = "absent_days", nullable = false)
    private int absentDays;

    protected AttendanceAnalytics() {}

    public static AttendanceAnalytics create(String tenantId, String period) {
        AttendanceAnalytics a = new AttendanceAnalytics();
        a.setTenantId(tenantId);
        a.period = period;
        a.totalClockIns = 0;
        a.totalRegularHours = BigDecimal.ZERO;
        a.totalOvertimeHours = BigDecimal.ZERO;
        a.averageHoursPerDay = BigDecimal.ZERO;
        a.lateArrivals = 0;
        a.absentDays = 0;
        return a;
    }

    public void recordClockIn() {
        this.totalClockIns++;
    }

    public void addHours(BigDecimal regular, BigDecimal overtime) {
        this.totalRegularHours = this.totalRegularHours.add(regular);
        this.totalOvertimeHours = this.totalOvertimeHours.add(overtime);
        if (totalClockIns > 0) {
            this.averageHoursPerDay = this.totalRegularHours.add(this.totalOvertimeHours)
                    .divide(BigDecimal.valueOf(totalClockIns), 2, java.math.RoundingMode.HALF_UP);
        }
    }

    public void incrementAbsent() { this.absentDays++; }
    public void incrementLateArrivals() { this.lateArrivals++; }

    public String getPeriod() { return period; }
    public int getTotalClockIns() { return totalClockIns; }
    public BigDecimal getTotalRegularHours() { return totalRegularHours; }
    public BigDecimal getTotalOvertimeHours() { return totalOvertimeHours; }
    public BigDecimal getAverageHoursPerDay() { return averageHoursPerDay; }
    public int getLateArrivals() { return lateArrivals; }
    public int getAbsentDays() { return absentDays; }
}