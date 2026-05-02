package com.andikisha.payroll.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Entity
@Table(name = "payroll_runs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "period", "pay_frequency"}))
public class PayrollRun extends BaseEntity {

    @Column(nullable = false, length = 7)
    private String period;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_frequency", nullable = false, length = 10)
    private PayFrequency payFrequency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayrollStatus status;

    @Column(name = "employee_count", nullable = false)
    private int employeeCount;

    @Column(name = "total_gross", precision = 15, scale = 2)
    private BigDecimal totalGross;

    @Column(name = "total_basic", precision = 15, scale = 2)
    private BigDecimal totalBasic;

    @Column(name = "total_allowances", precision = 15, scale = 2)
    private BigDecimal totalAllowances;

    @Column(name = "total_paye", precision = 15, scale = 2)
    private BigDecimal totalPaye;

    @Column(name = "total_nssf", precision = 15, scale = 2)
    private BigDecimal totalNssf;

    @Column(name = "total_shif", precision = 15, scale = 2)
    private BigDecimal totalShif;

    @Column(name = "total_housing_levy", precision = 15, scale = 2)
    private BigDecimal totalHousingLevy;

    @Column(name = "total_other_deductions", precision = 15, scale = 2)
    private BigDecimal totalOtherDeductions;

    @Column(name = "total_net", precision = 15, scale = 2)
    private BigDecimal totalNet;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "initiated_by")
    private String initiatedBy;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "payrollRun", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private List<PaySlip> paySlips = new ArrayList<>();

    protected PayrollRun() {}

    public static PayrollRun create(String tenantId, String period,
                                    PayFrequency payFrequency, String initiatedBy) {
        PayrollRun run = new PayrollRun();
        run.setTenantId(tenantId);
        run.period = period;
        run.payFrequency = payFrequency;
        run.status = PayrollStatus.DRAFT;
        run.employeeCount = 0;
        run.currency = "KES";
        run.initiatedBy = initiatedBy;
        run.totalGross = BigDecimal.ZERO;
        run.totalBasic = BigDecimal.ZERO;
        run.totalAllowances = BigDecimal.ZERO;
        run.totalPaye = BigDecimal.ZERO;
        run.totalNssf = BigDecimal.ZERO;
        run.totalShif = BigDecimal.ZERO;
        run.totalHousingLevy = BigDecimal.ZERO;
        run.totalOtherDeductions = BigDecimal.ZERO;
        run.totalNet = BigDecimal.ZERO;
        return run;
    }

    public void markCalculating() {
        if (this.status != PayrollStatus.DRAFT) {
            throw new BusinessRuleException("Can only start calculating from DRAFT status");
        }
        this.status = PayrollStatus.CALCULATING;
    }

    public void addPaySlip(PaySlip paySlip) {
        paySlip.setPayrollRun(this);
        this.paySlips.add(paySlip);
    }

    public void finishCalculation() {
        if (this.status != PayrollStatus.CALCULATING) {
            throw new BusinessRuleException("Cannot finish calculation unless CALCULATING");
        }
        this.employeeCount = this.paySlips.size();
        this.totalGross = sumField(paySlips, PaySlip::getGrossPay);
        this.totalBasic = sumField(paySlips, PaySlip::getBasicPay);
        this.totalAllowances = sumField(paySlips, PaySlip::getTotalAllowances);
        this.totalPaye = sumField(paySlips, PaySlip::getPaye);
        this.totalNssf = sumField(paySlips, PaySlip::getNssf);
        this.totalShif = sumField(paySlips, PaySlip::getShif);
        this.totalHousingLevy = sumField(paySlips, PaySlip::getHousingLevy);
        this.totalOtherDeductions = sumField(paySlips, PaySlip::getOtherDeductions);
        this.totalNet = sumField(paySlips, PaySlip::getNetPay);
        this.status = PayrollStatus.CALCULATED;
    }

    public void approve(String approvedBy, LocalDateTime at) {
        if (this.status != PayrollStatus.CALCULATED) {
            throw new BusinessRuleException("Can only approve a CALCULATED payroll");
        }
        if (this.employeeCount == 0) {
            throw new BusinessRuleException("Cannot approve an empty payroll run");
        }
        this.approvedBy = approvedBy;
        this.approvedAt = at;
        this.status = PayrollStatus.APPROVED;
    }

    public void markProcessing() {
        if (this.status != PayrollStatus.APPROVED) {
            throw new BusinessRuleException("Can only process an APPROVED payroll");
        }
        this.status = PayrollStatus.PROCESSING;
    }

    public void complete(LocalDateTime at) {
        if (this.status != PayrollStatus.PROCESSING) {
            throw new BusinessRuleException("Can only complete a PROCESSING payroll");
        }
        this.completedAt = at;
        this.status = PayrollStatus.COMPLETED;
    }

    public void cancel(String reason) {
        if (this.status == PayrollStatus.COMPLETED || this.status == PayrollStatus.PROCESSING) {
            throw new BusinessRuleException("Cannot cancel a payroll that is " + this.status);
        }
        appendNote("CANCELLED: " + reason);
        this.status = PayrollStatus.CANCELLED;
    }

    public void fail(String reason) {
        if (this.status == PayrollStatus.COMPLETED || this.status == PayrollStatus.APPROVED) {
            throw new BusinessRuleException("Cannot fail a payroll that is already " + this.status);
        }
        appendNote("FAILED: " + reason);
        this.status = PayrollStatus.FAILED;
    }

    private void appendNote(String note) {
        this.notes = (this.notes != null && !this.notes.isBlank())
                ? this.notes + "\n" + note
                : note;
    }

    private BigDecimal sumField(List<PaySlip> slips,
                                java.util.function.Function<PaySlip, BigDecimal> getter) {
        return slips.stream()
                .map(getter)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}