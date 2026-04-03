package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class EmployeeCreatedEvent extends BaseEvent {

    private final String employeeId;
    private final String employeeNumber;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phoneNumber;
    private final String departmentId;
    private final BigDecimal basicSalary;
    private final String currency;

    public EmployeeCreatedEvent(String tenantId, String employeeId,
                                String employeeNumber, String firstName, String lastName,
                                String email, String phoneNumber, String departmentId,
                                BigDecimal basicSalary, String currency) {
        super("employee.created", tenantId);
        this.employeeId = employeeId;
        this.employeeNumber = employeeNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.departmentId = departmentId;
        this.basicSalary = basicSalary;
        this.currency = currency;
    }

    protected EmployeeCreatedEvent() { super(); this.employeeId = null; this.employeeNumber = null; this.firstName = null; this.lastName = null; this.email = null; this.phoneNumber = null; this.departmentId = null; this.basicSalary = null; this.currency = null; }

    public String getEmployeeId() { return employeeId; }
    public String getEmployeeNumber() { return employeeNumber; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getDepartmentId() { return departmentId; }
    public BigDecimal getBasicSalary() { return basicSalary; }
    public String getCurrency() { return currency; }
}