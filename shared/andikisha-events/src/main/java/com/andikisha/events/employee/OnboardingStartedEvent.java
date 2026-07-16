package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;

public class OnboardingStartedEvent extends BaseEvent {

    private String employeeId;
    private String instanceId;

    public OnboardingStartedEvent(String tenantId, String employeeId, String instanceId) {
        super("employee.onboarding.started", tenantId);
        this.employeeId = employeeId;
        this.instanceId = instanceId;
    }

    protected OnboardingStartedEvent() { super(); }

    public String getEmployeeId() { return employeeId; }
    public String getInstanceId() { return instanceId; }
}
