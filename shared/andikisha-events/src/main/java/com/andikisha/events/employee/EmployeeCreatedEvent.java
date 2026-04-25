package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class EmployeeCreatedEvent extends BaseEvent {

    private String employeeId;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String departmentId;
    private BigDecimal basicSalary;
    private String currency;

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

    protected EmployeeCreatedEvent() { super(); }

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