package com.andikisha.analytics.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "payroll_summaries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "period"}))
public class PayrollSummary extends BaseEntity {

    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "employee_count", nullable = false)
    private int employeeCount;

    @Column(name = "total_gross", precision = 15, scale = 2)
    private BigDecimal totalGross;

    @Column(name = "total_net", precision = 15, scale = 2)
    private BigDecimal totalNet;

    @Column(name = "total_paye", precision = 15, scale = 2)
    private BigDecimal totalPaye;

    @Column(name = "total_nssf", precision = 15, scale = 2)
    private BigDecimal totalNssf;

    @Column(name = "total_shif", precision = 15, scale = 2)
    private BigDecimal totalShif;

    @Column(name = "total_housing_levy", precision = 15, scale = 2)
    private BigDecimal totalHousingLevy;

    @Column(name = "average_gross", precision = 15, scale = 2)
    private BigDecimal averageGross;

    @Column(name = "average_net", precision = 15, scale = 2)
    private BigDecimal averageNet;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "payroll_run_id", length = 50)
    private String payrollRunId;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    protected PayrollSummary() {}

    public static PayrollSummary create(String tenantId, String period,
                                        int employeeCount,
                                        BigDecimal totalGross, BigDecimal totalNet,
                                        BigDecimal totalPaye, BigDecimal totalNssf,
                                        BigDecimal totalShif, BigDecimal totalHousingLevy,
                                        String payrollRunId, String approvedBy) {
        PayrollSummary s = new PayrollSummary();
        s.setTenantId(tenantId);
        s.period = period;
        s.employeeCount = employeeCount;
        s.currency = "KES";
        s.payrollRunId = payrollRunId;
        s.approvedBy = approvedBy;

        s.totalGross       = totalGross       != null ? totalGross       : BigDecimal.ZERO;
        s.totalNet         = totalNet         != null ? totalNet         : BigDecimal.ZERO;
        s.totalPaye        = totalPaye        != null ? totalPaye        : BigDecimal.ZERO;
        s.totalNssf        = totalNssf        != null ? totalNssf        : BigDecimal.ZERO;
        s.totalShif        = totalShif        != null ? totalShif        : BigDecimal.ZERO;
        s.totalHousingLevy = totalHousingLevy != null ? totalHousingLevy : BigDecimal.ZERO;

        if (employeeCount > 0) {
            s.averageGross = s.totalGross.divide(
                    BigDecimal.valueOf(employeeCount), 2, RoundingMode.HALF_UP);
            s.averageNet = s.totalNet.divide(
                    BigDecimal.valueOf(employeeCount), 2, RoundingMode.HALF_UP);
        } else {
            s.averageGross = BigDecimal.ZERO;
            s.averageNet = BigDecimal.ZERO;
        }

        return s;
    }

    public String getPeriod() { return period; }
    public int getEmployeeCount() { return employeeCount; }
    public BigDecimal getTotalGross() { return totalGross; }
    public BigDecimal getTotalNet() { return totalNet; }
    public BigDecimal getTotalPaye() { return totalPaye; }
    public BigDecimal getTotalNssf() { return totalNssf; }
    public BigDecimal getTotalShif() { return totalShif; }
    public BigDecimal getTotalHousingLevy() { return totalHousingLevy; }
    public BigDecimal getAverageGross() { return averageGross; }
    public BigDecimal getAverageNet() { return averageNet; }
    public String getCurrency() { return currency; }
    public String getPayrollRunId() { return payrollRunId; }
    public String getApprovedBy() { return approvedBy; }
}