package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class EmployeeUserProvisionedEvent extends BaseEvent {

    private String employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private String employeeNumber;
    private String tempPassword;

    public EmployeeUserProvisionedEvent(String tenantId, String employeeId,
                                        String email, String firstName, String lastName,
                                        String employeeNumber, String tempPassword) {
        super("auth.employee_provisioned", tenantId);
        this.employeeId = employeeId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeNumber = employeeNumber;
        this.tempPassword = tempPassword;
    }

    protected EmployeeUserProvisionedEvent() { super(); }

    public String getEmployeeId()     { return employeeId; }
    public String getEmail()          { return email; }
    public String getFirstName()      { return firstName; }
    public String getLastName()       { return lastName; }
    public String getEmployeeNumber() { return employeeNumber; }
    public String getTempPassword()   { return tempPassword; }
}
