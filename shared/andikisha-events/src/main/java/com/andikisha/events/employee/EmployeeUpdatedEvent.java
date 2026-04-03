package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;

public class EmployeeUpdatedEvent extends BaseEvent {

    private final String employeeId;
    private final String updatedBy;

    public EmployeeUpdatedEvent(String tenantId, String employeeId, String updatedBy) {
        super("employee.updated", tenantId);
        this.employeeId = employeeId;
        this.updatedBy = updatedBy;
    }

    protected EmployeeUpdatedEvent() { super(); this.employeeId = null; this.updatedBy = null; }

    public String getEmployeeId() { return employeeId; }
    public String getUpdatedBy() { return updatedBy; }
}