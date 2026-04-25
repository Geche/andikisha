package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;

public class PayrollProcessedEvent extends BaseEvent {

    private String payrollRunId;
    private String period;

    public PayrollProcessedEvent(String tenantId, String payrollRunId, String period) {
        super("payroll.processed", tenantId);
        this.payrollRunId = payrollRunId;
        this.period = period;
    }

    protected PayrollProcessedEvent() { super(); }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPeriod() { return period; }
}