package com.andikisha.events.attendance;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;
import java.time.Instant;

public class ClockOutEvent extends BaseEvent {

    private final String employeeId;
    private final Instant clockOutTime;
    private final BigDecimal hoursWorked;

    public ClockOutEvent(String tenantId, String employeeId,
                         Instant clockOutTime, BigDecimal hoursWorked) {
        super("attendance.clock_out", tenantId);
        this.employeeId = employeeId;
        this.clockOutTime = clockOutTime;
        this.hoursWorked = hoursWorked;
    }

    protected ClockOutEvent() {
        super();
        this.employeeId = null;
        this.clockOutTime = null;
        this.hoursWorked = BigDecimal.ZERO;
    }

    public String getEmployeeId() { return employeeId; }
    public Instant getClockOutTime() { return clockOutTime; }
    public BigDecimal getHoursWorked() { return hoursWorked; }
}
