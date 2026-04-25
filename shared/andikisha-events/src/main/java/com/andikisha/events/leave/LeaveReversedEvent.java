package com.andikisha.events.leave;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class LeaveReversedEvent extends BaseEvent {

    private String leaveRequestId;
    private String employeeId;
    private String leaveType;
    private BigDecimal days;
    private String reason;
    private String reversedBy;

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

    protected LeaveReversedEvent() { super(); }

    public String getLeaveRequestId() { return leaveRequestId; }
    public String getEmployeeId()     { return employeeId; }
    public String getLeaveType()      { return leaveType; }
    public BigDecimal getDays()       { return days; }
    public String getReason()         { return reason; }
    public String getReversedBy()     { return reversedBy; }
}
