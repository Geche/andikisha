package com.andikisha.events.leave;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class LeaveReversedEvent extends BaseEvent {

    private final String leaveRequestId;
    private final String employeeId;
    private final String leaveType;
    private final BigDecimal days;
    private final String reason;
    private final String reversedBy;

    public LeaveReversedEvent(String tenantId, String leaveRequestId,
                              String employeeId, String leaveType,
                              BigDecimal days, String reason, String reversedBy) {
        super("leave.reversed", tenantId);
        this.leaveRequestId = leaveRequestId;
        this.employeeId = employeeId;
        this.leaveType = leaveType;
        this.days = days;
        this.reason = reason;
        this.reversedBy = reversedBy;
    }

    protected LeaveReversedEvent() { super(); this.leaveRequestId = null; this.employeeId = null; this.leaveType = null; this.days = null; this.reason = null; this.reversedBy = null; }

    public String getLeaveRequestId() { return leaveRequestId; }
    public String getEmployeeId()     { return employeeId; }
    public String getLeaveType()      { return leaveType; }
    public BigDecimal getDays()       { return days; }
    public String getReason()         { return reason; }
    public String getReversedBy()     { return reversedBy; }
}
