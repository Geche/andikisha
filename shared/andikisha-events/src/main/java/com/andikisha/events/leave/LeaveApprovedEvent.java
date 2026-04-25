package com.andikisha.events.leave;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;
import java.time.LocalDate;

public class LeaveApprovedEvent extends BaseEvent {

    private String leaveRequestId;
    private String employeeId;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal days;
    private String approvedBy;

    public LeaveApprovedEvent(String tenantId, String leaveRequestId,
                              String employeeId, String leaveType,
                              LocalDate startDate, LocalDate endDate,
                              BigDecimal days, String approvedBy) {
        super("leave.approved", tenantId);
        this.leaveRequestId = leaveRequestId;
        this.employeeId = employeeId;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.approvedBy = approvedBy;
    }

    protected LeaveApprovedEvent() { super(); }

    public String getLeaveRequestId() { return leaveRequestId; }
    public String getEmployeeId() { return employeeId; }
    public String getLeaveType() { return leaveType; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public BigDecimal getDays() { return days; }
    public String getApprovedBy() { return approvedBy; }
}