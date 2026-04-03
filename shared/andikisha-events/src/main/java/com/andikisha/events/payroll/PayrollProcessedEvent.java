package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;

public class PayrollProcessedEvent extends BaseEvent {

    private final String payrollRunId;
    private final String period;

    public PayrollProcessedEvent(String tenantId, String payrollRunId, String period) {
        super("payroll.processed", tenantId);
        this.payrollRunId = payrollRunId;
        this.period = period;
    }

    protected PayrollProcessedEvent() { super(); this.payrollRunId = null; this.period = null; }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPeriod() { return period; }
}