package com.andikisha.attendance.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "work_schedules")
public class WorkSchedule extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "hours_per_day", nullable = false, precision = 4, scale = 1)
    private BigDecimal hoursPerDay;

    @Column(name = "working_days_per_week", nullable = false)
    private int workingDaysPerWeek;

    @Column(name = "late_threshold_minutes", nullable = false)
    private int lateThresholdMinutes;

    @Column(name = "is_default", nullable = false)
    private boolean defaultSchedule = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected WorkSchedule() {}

    public static WorkSchedule createDefault(String tenantId) {
        WorkSchedule schedule = new WorkSchedule();
        schedule.setTenantId(tenantId);
        schedule.name = "Standard";
        schedule.startTime = LocalTime.of(8, 0);
        schedule.endTime = LocalTime.of(17, 0);
        schedule.hoursPerDay = new BigDecimal("8.0");
        schedule.workingDaysPerWeek = 5;
        schedule.lateThresholdMinutes = 15;
        schedule.defaultSchedule = true;
        schedule.active = true;
        return schedule;
    }

    public static WorkSchedule create(String tenantId, String name,
                                      LocalTime startTime, LocalTime endTime,
                                      BigDecimal hoursPerDay, int workingDaysPerWeek,
                                      int lateThresholdMinutes) {
        WorkSchedule schedule = new WorkSchedule();
        schedule.setTenantId(tenantId);
        schedule.name = name;
        schedule.startTime = startTime;
        schedule.endTime = endTime;
        schedule.hoursPerDay = hoursPerDay;
        schedule.workingDaysPerWeek = workingDaysPerWeek;
        schedule.lateThresholdMinutes = lateThresholdMinutes;
        schedule.active = true;
        return schedule;
    }

    public String getName() { return name; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BigDecimal getHoursPerDay() { return hoursPerDay; }
    public int getWorkingDaysPerWeek() { return workingDaysPerWeek; }
    public int getLateThresholdMinutes() { return lateThresholdMinutes; }
    public boolean isDefaultSchedule() { return defaultSchedule; }
    public boolean isActive() { return active; }
}