package com.andikisha.events.attendance;

import com.andikisha.events.BaseEvent;
import java.time.Instant;

public class ClockOutEvent extends BaseEvent {

    private final String employeeId;
    private final Instant clockOutTime;
    private final double hoursWorked;

    public ClockOutEvent(String tenantId, String employeeId,
                         Instant clockOutTime, double hoursWorked) {
        super("attendance.clock_out", tenantId);
        this.employeeId = employeeId;
        this.clockOutTime = clockOutTime;
        this.hoursWorked = hoursWorked;
    }

    protected ClockOutEvent() { super(); this.employeeId = null; this.clockOutTime = null; this.hoursWorked = 0; }

    public String getEmployeeId() { return employeeId; }
    public Instant getClockOutTime() { return clockOutTime; }
    public double getHoursWorked() { return hoursWorked; }
}
