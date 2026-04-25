package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PayrollApprovedEvent extends BaseEvent {

    private final String payrollRunId;
    private final String period;
    private final int employeeCount;
    private final BigDecimal totalGross;
    private final BigDecimal totalNet;
    private final BigDecimal totalPaye;
    private final BigDecimal totalNssf;
    private final BigDecimal totalShif;
    private final BigDecimal totalHousingLevy;
    private final String approvedBy;

    public PayrollApprovedEvent(String tenantId, String payrollRunId,
                                String period, int employeeCount,
                                BigDecimal totalGross, BigDecimal totalNet,
                                BigDecimal totalPaye, BigDecimal totalNssf,
                                BigDecimal totalShif, BigDecimal totalHousingLevy,
                                String approvedBy) {
        super("payroll.approved", tenantId);
        this.payrollRunId = payrollRunId;
        this.period = period;
        this.employeeCount = employeeCount;
        this.totalGross = totalGross;
        this.totalNet = totalNet;
        this.totalPaye = totalPaye;
        this.totalNssf = totalNssf;
        this.totalShif = totalShif;
        this.totalHousingLevy = totalHousingLevy;
        this.approvedBy = approvedBy;
    }

    protected PayrollApprovedEvent() {
        super();
        this.payrollRunId = null; this.period = null; this.employeeCount = 0;
        this.totalGross = null; this.totalNet = null;
        this.totalPaye = null; this.totalNssf = null;
        this.totalShif = null; this.totalHousingLevy = null;
        this.approvedBy = null;
    }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPeriod() { return period; }
    public int getEmployeeCount() { return employeeCount; }
    public BigDecimal getTotalGross() { return totalGross; }
    public BigDecimal getTotalNet() { return totalNet; }
    public BigDecimal getTotalPaye() { return totalPaye; }
    public BigDecimal getTotalNssf() { return totalNssf; }
    public BigDecimal getTotalShif() { return totalShif; }
    public BigDecimal getTotalHousingLevy() { return totalHousingLevy; }
    public String getApprovedBy() { return approvedBy; }
}