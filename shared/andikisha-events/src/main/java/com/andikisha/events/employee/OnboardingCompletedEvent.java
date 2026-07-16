package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;

public class OnboardingCompletedEvent extends BaseEvent {

    private String employeeId;
    private String instanceId;

    public OnboardingCompletedEvent(String tenantId, String employeeId, String instanceId) {
        super("employee.onboarding.completed", tenantId);
        this.employeeId = employeeId;
        this.instanceId = instanceId;
    }

    protected OnboardingCompletedEvent() { super(); }

    public String getEmployeeId() { return employeeId; }
    public String getInstanceId() { return instanceId; }
}
