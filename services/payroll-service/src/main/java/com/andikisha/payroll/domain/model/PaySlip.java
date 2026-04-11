package com.andikisha.payroll.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Entity
@Table(name = "pay_slips")
public class PaySlip extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "employee_number", nullable = false, length = 20)
    private String employeeNumber;

    @Column(name = "employee_name", nullable = false, length = 200)
    private String employeeName;

    @Column(name = "basic_pay", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicPay;

    @Column(name = "housing_allowance", nullable = false, precision = 15, scale = 2)
    private BigDecimal housingAllowance;

    @Column(name = "transport_allowance", nullable = false, precision = 15, scale = 2)
    private BigDecimal transportAllowance;

    @Column(name = "medical_allowance", nullable = false, precision = 15, scale = 2)
    private BigDecimal medicalAllowance;

    @Column(name = "other_allowances", nullable = false, precision = 15, scale = 2)
    private BigDecimal otherAllowances;

    @Column(name = "total_allowances", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAllowances;

    @Column(name = "gross_pay", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossPay;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal paye;

    @Column(name = "nssf_employee", nullable = false, precision = 15, scale = 2)
    private BigDecimal nssf;

    @Column(name = "nssf_employer", nullable = false, precision = 15, scale = 2)
    private BigDecimal nssfEmployer;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal shif;

    @Column(name = "housing_levy_employee", nullable = false, precision = 15, scale = 2)
    private BigDecimal housingLevy;

    @Column(name = "housing_levy_employer", nullable = false, precision = 15, scale = 2)
    private BigDecimal housingLevyEmployer;

    @Column(precision = 15, scale = 2)
    private BigDecimal helb;

    @Column(name = "other_deductions", nullable = false, precision = 15, scale = 2)
    private BigDecimal otherDeductions;

    @Column(name = "total_deductions", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "personal_relief", nullable = false, precision = 15, scale = 2)
    private BigDecimal personalRelief;

    @Column(name = "insurance_relief", nullable = false, precision = 15, scale = 2)
    private BigDecimal insuranceRelief;

    @Column(name = "net_pay", nullable = false, precision = 15, scale = 2)
    private BigDecimal netPay;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "mpesa_receipt", length = 50)
    private String mpesaReceipt;

    @Column(name = "payment_phone", length = 20)
    private String paymentPhone;

    protected PaySlip() {}

    void setPayrollRun(PayrollRun payrollRun) {
        this.payrollRun = payrollRun;
    }

    public void markPaymentProcessing() {
        this.paymentStatus = PaymentStatus.PROCESSING;
    }

    public void markPaid(String mpesaReceipt) {
        this.paymentStatus = PaymentStatus.PAID;
        this.mpesaReceipt = mpesaReceipt;
    }

    public void markPaymentFailed() {
        this.paymentStatus = PaymentStatus.FAILED;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final PaySlip slip = new PaySlip();

        public Builder tenantId(String v) { slip.setTenantId(v); return this; }
        public Builder employeeId(UUID v) { slip.employeeId = v; return this; }
        public Builder employeeNumber(String v) { slip.employeeNumber = v; return this; }
        public Builder employeeName(String v) { slip.employeeName = v; return this; }
        public Builder basicPay(BigDecimal v) { slip.basicPay = v; return this; }
        public Builder housingAllowance(BigDecimal v) { slip.housingAllowance = v; return this; }
        public Builder transportAllowance(BigDecimal v) { slip.transportAllowance = v; return this; }
        public Builder medicalAllowance(BigDecimal v) { slip.medicalAllowance = v; return this; }
        public Builder otherAllowances(BigDecimal v) { slip.otherAllowances = v; return this; }
        public Builder totalAllowances(BigDecimal v) { slip.totalAllowances = v; return this; }
        public Builder grossPay(BigDecimal v) { slip.grossPay = v; return this; }
        public Builder paye(BigDecimal v) { slip.paye = v; return this; }
        public Builder nssf(BigDecimal v) { slip.nssf = v; return this; }
        public Builder nssfEmployer(BigDecimal v) { slip.nssfEmployer = v; return this; }
        public Builder shif(BigDecimal v) { slip.shif = v; return this; }
        public Builder housingLevy(BigDecimal v) { slip.housingLevy = v; return this; }
        public Builder housingLevyEmployer(BigDecimal v) { slip.housingLevyEmployer = v; return this; }
        public Builder helb(BigDecimal v) { slip.helb = v; return this; }
        public Builder otherDeductions(BigDecimal v) { slip.otherDeductions = v; return this; }
        public Builder totalDeductions(BigDecimal v) { slip.totalDeductions = v; return this; }
        public Builder personalRelief(BigDecimal v) { slip.personalRelief = v; return this; }
        public Builder insuranceRelief(BigDecimal v) { slip.insuranceRelief = v; return this; }
        public Builder netPay(BigDecimal v) { slip.netPay = v; return this; }
        public Builder currency(String v) { slip.currency = v; return this; }
        public Builder paymentPhone(String v) { slip.paymentPhone = v; return this; }

        public PaySlip build() {
            slip.paymentStatus = PaymentStatus.PENDING;
            return slip;
        }
    }
}