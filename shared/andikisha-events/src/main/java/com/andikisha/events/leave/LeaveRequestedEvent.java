package com.andikisha.events.leave;

import com.andikisha.events.BaseEvent;
import java.time.LocalDate;

public class LeaveRequestedEvent extends BaseEvent {

    private final String leaveRequestId;
    private final String employeeId;
    private final String leaveType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final double days;

    public LeaveRequestedEvent(String tenantId, String leaveRequestId,
                               String employeeId, String leaveType,
                               LocalDate startDate, LocalDate endDate, double days) {
        super("leave.requested", tenantId);
        this.leaveRequestId = leaveRequestId;
        this.employeeId = employeeId;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
    }

    protected LeaveRequestedEvent() { super(); this.leaveRequestId = null; this.employeeId = null; this.leaveType = null; this.startDate = null; this.endDate = null; this.days = 0; }

    public String getLeaveRequestId() { return leaveRequestId; }
    public String getEmployeeId() { return employeeId; }
    public String getLeaveType() { return leaveType; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public double getDays() { return days; }
}