package com.andikisha.events.leave;

import com.andikisha.events.BaseEvent;

public class LeaveRejectedEvent extends BaseEvent {

    private String leaveRequestId;
    private String employeeId;
    private String leaveType;
    private String reason;
    private String rejectedBy;

    public LeaveRejectedEvent(String tenantId, String leaveRequestId,
                              String employeeId, String leaveType,
                              String reason, String rejectedBy) {
        super("leave.rejected", tenantId);
        this.leaveRequestId = leaveRequestId;
        this.employeeId = employeeId;
        this.leaveType = leaveType;
        this.reason = reason;
        this.rejectedBy = rejectedBy;
    }

    protected LeaveRejectedEvent() { super(); }

    public String getLeaveRequestId() { return leaveRequestId; }
    public String getEmployeeId() { return employeeId; }
    public String getLeaveType() { return leaveType; }
    public String getReason() { return reason; }
    public String getRejectedBy() { return rejectedBy; }
}