package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;

public class EmployeeTerminatedEvent extends BaseEvent {

    private final String employeeId;
    private final String reason;
    private final String terminatedBy;

    public EmployeeTerminatedEvent(String tenantId, String employeeId,
                                   String reason, String terminatedBy) {
        super("employee.terminated", tenantId);
        this.employeeId = employeeId;
        this.reason = reason;
        this.terminatedBy = terminatedBy;
    }

    protected EmployeeTerminatedEvent() { super(); this.employeeId = null; this.reason = null; this.terminatedBy = null; }

    public String getEmployeeId() { return employeeId; }
    public String getReason() { return reason; }
    public String getTerminatedBy() { return terminatedBy; }
}