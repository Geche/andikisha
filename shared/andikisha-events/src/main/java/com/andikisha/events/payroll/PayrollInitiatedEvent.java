package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;

public class PayrollInitiatedEvent extends BaseEvent {

    private String payrollRunId;
    private String period;
    private int employeeCount;
    private String initiatedBy;

    public PayrollInitiatedEvent(String tenantId, String payrollRunId,
                                 String period, int employeeCount, String initiatedBy) {
        super("payroll.initiated", tenantId);
        this.payrollRunId = payrollRunId;
        this.period = period;
        this.employeeCount = employeeCount;
        this.initiatedBy = initiatedBy;
    }

    protected PayrollInitiatedEvent() { super(); }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPeriod() { return period; }
    public int getEmployeeCount() { return employeeCount; }
    public String getInitiatedBy() { return initiatedBy; }
}