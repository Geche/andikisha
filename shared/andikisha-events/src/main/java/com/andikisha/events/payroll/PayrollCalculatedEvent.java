package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PayrollCalculatedEvent extends BaseEvent {

    private String payrollRunId;
    private String period;
    private int employeeCount;
    private BigDecimal totalGross;
    private BigDecimal totalNet;

    public PayrollCalculatedEvent(String tenantId, String payrollRunId,
                                  String period, int employeeCount,
                                  BigDecimal totalGross, BigDecimal totalNet) {
        super("payroll.calculated", tenantId);
        this.payrollRunId = payrollRunId;
        this.period = period;
        this.employeeCount = employeeCount;
        this.totalGross = totalGross;
        this.totalNet = totalNet;
    }

    protected PayrollCalculatedEvent() { super(); }

    public String getPayrollRunId()  { return payrollRunId; }
    public String getPeriod()        { return period; }
    public int getEmployeeCount()    { return employeeCount; }
    public BigDecimal getTotalGross() { return totalGross; }
    public BigDecimal getTotalNet()  { return totalNet; }
}
