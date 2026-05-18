package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;
import lombok.Getter;

@Getter
public class EmployeeUserProvisionedEvent extends BaseEvent {

    private String employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private String employeeNumber;
    private String tempPassword;

    protected EmployeeUserProvisionedEvent() {}

    public EmployeeUserProvisionedEvent(String tenantId, String employeeId,
                                        String email, String firstName, String lastName,
                                        String employeeNumber, String tempPassword) {
        super("EmployeeUserProvisioned", tenantId);
        this.employeeId = employeeId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeNumber = employeeNumber;
        this.tempPassword = tempPassword;
    }
}
