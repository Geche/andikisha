package com.andikisha.events.employee;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class SalaryChangedEvent extends BaseEvent {

    private final String employeeId;
    private final BigDecimal oldSalary;
    private final BigDecimal newSalary;
    private final String currency;
    private final String changedBy;

    public SalaryChangedEvent(String tenantId, String employeeId,
                              BigDecimal oldSalary, BigDecimal newSalary,
                              String currency, String changedBy) {
        super("employee.salary_changed", tenantId);
        this.employeeId = employeeId;
        this.oldSalary = oldSalary;
        this.newSalary = newSalary;
        this.currency = currency;
        this.changedBy = changedBy;
    }

    protected SalaryChangedEvent() { super(); this.employeeId = null; this.oldSalary = null; this.newSalary = null; this.currency = null; this.changedBy = null; }

    public String getEmployeeId() { return employeeId; }
    public BigDecimal getOldSalary() { return oldSalary; }
    public BigDecimal getNewSalary() { return newSalary; }
    public String getCurrency() { return currency; }
    public String getChangedBy() { return changedBy; }
}