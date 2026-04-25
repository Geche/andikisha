package com.andikisha.events.attendance;

import com.andikisha.events.BaseEvent;
import java.time.Instant;

public class ClockInEvent extends BaseEvent {

    private String employeeId;
    private Instant clockInTime;
    private String source;

    public ClockInEvent(String tenantId, String employeeId,
                        Instant clockInTime, String source) {
        super("attendance.clock_in", tenantId);
        this.employeeId = employeeId;
        this.clockInTime = clockInTime;
        this.source = source;
    }

    protected ClockInEvent() { super(); }

    public String getEmployeeId() { return employeeId; }
    public Instant getClockInTime() { return clockInTime; }
    public String getSource() { return source; }
}
