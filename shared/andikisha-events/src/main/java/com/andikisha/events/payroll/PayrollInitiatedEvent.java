package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;

public class PayrollInitiatedEvent extends BaseEvent {

    private final String payrollRunId;
    private final String period;
    private final int employeeCount;
    private final String initiatedBy;

    public PayrollInitiatedEvent(String tenantId, String payrollRunId,
                                 String period, int employeeCount, String initiatedBy) {
        super("payroll.initiated", tenantId);
        this.payrollRunId = payrollRunId;
        this.period = period;
        this.employeeCount = employeeCount;
        this.initiatedBy = initiatedBy;
    }

    protected PayrollInitiatedEvent() { super(); this.payrollRunId = null; this.period = null; this.employeeCount = 0; this.initiatedBy = null; }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPeriod() { return period; }
    public int getEmployeeCount() { return employeeCount; }
    public String getInitiatedBy() { return initiatedBy; }
}