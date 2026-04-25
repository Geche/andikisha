package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PayrollApprovedEvent extends BaseEvent {

    private String payrollRunId;
    private String period;
    private int employeeCount;
    private BigDecimal totalGross;
    private BigDecimal totalNet;
    private BigDecimal totalPaye;
    private BigDecimal totalNssf;
    private BigDecimal totalShif;
    private BigDecimal totalHousingLevy;
    private String approvedBy;

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

    protected PayrollApprovedEvent() { super(); }

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