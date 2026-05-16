package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PaymentsCompletedEvent extends BaseEvent {

    private String payrollRunId;
    private long countSuccessful;
    private long countFailed;
    private BigDecimal totalDisbursed;

    public PaymentsCompletedEvent(String tenantId, String payrollRunId,
                                  long countSuccessful, long countFailed,
                                  BigDecimal totalDisbursed) {
        super("payments.completed", tenantId);
        this.payrollRunId = payrollRunId;
        this.countSuccessful = countSuccessful;
        this.countFailed = countFailed;
        this.totalDisbursed = totalDisbursed;
    }

    protected PaymentsCompletedEvent() { super(); }

    public String getPayrollRunId()   { return payrollRunId;    }
    public long getCountSuccessful()  { return countSuccessful; }
    public long getCountFailed()      { return countFailed;     }
    public BigDecimal getTotalDisbursed() { return totalDisbursed; }
}
