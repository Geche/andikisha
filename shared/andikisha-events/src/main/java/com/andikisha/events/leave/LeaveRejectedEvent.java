package com.andikisha.events.leave;

import com.andikisha.events.BaseEvent;

public class LeaveRejectedEvent extends BaseEvent {

    private final String leaveRequestId;
    private final String employeeId;
    private final String reason;
    private final String rejectedBy;

    public LeaveRejectedEvent(String tenantId, String leaveRequestId,
                              String employeeId, String reason, String rejectedBy) {
        super("leave.rejected", tenantId);
        this.leaveRequestId = leaveRequestId;
        this.employeeId = employeeId;
        this.reason = reason;
        this.rejectedBy = rejectedBy;
    }

    protected LeaveRejectedEvent() { super(); this.leaveRequestId = null; this.employeeId = null; this.reason = null; this.rejectedBy = null; }

    public String getLeaveRequestId() { return leaveRequestId; }
    public String getEmployeeId() { return employeeId; }
    public String getReason() { return reason; }
    public String getRejectedBy() { return rejectedBy; }
}