package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;

public class OffboardingStartedEvent extends BaseEvent {

    private String employeeId;
    private String instanceId;

    public OffboardingStartedEvent(String tenantId, String employeeId, String instanceId) {
        super("employee.offboarding.started", tenantId);
        this.employeeId = employeeId;
        this.instanceId = instanceId;
    }

    protected OffboardingStartedEvent() { super(); }

    public String getEmployeeId() { return employeeId; }
    public String getInstanceId() { return instanceId; }
}
