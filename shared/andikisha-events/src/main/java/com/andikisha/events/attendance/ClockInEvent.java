package com.andikisha.events.attendance;

import com.andikisha.events.BaseEvent;
import java.time.Instant;

public class ClockInEvent extends BaseEvent {

    private final String employeeId;
    private final Instant clockInTime;
    private final String source;

    public ClockInEvent(String tenantId, String employeeId,
                        Instant clockInTime, String source) {
        super("attendance.clock_in", tenantId);
        this.employeeId = employeeId;
        this.clockInTime = clockInTime;
        this.source = source;
    }

    protected ClockInEvent() { super(); this.employeeId = null; this.clockInTime = null; this.source = null; }

    public String getEmployeeId() { return employeeId; }
    public Instant getClockInTime() { return clockInTime; }
    public String getSource() { return source; }
}
