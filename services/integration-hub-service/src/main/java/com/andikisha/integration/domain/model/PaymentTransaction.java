package com.andikisha.integration.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction extends BaseEntity {

    @Column(name = "payroll_run_id", nullable = false)
    private UUID payrollRunId;

    @Column(name = "pay_slip_id", nullable = false)
    private UUID paySlipId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "employee_name", length = 200)
    private String employeeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    @Column(name = "external_reference", length = 100)
    private String externalReference;

    @Column(name = "provider_receipt", length = 100)
    private String providerReceipt;

    @Column(name = "conversation_id", length = 100)
    private String conversationId;

    @Column(name = "error_code", length = 20)
    private String errorCode;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    protected PaymentTransaction() {}

    public static PaymentTransaction create(String tenantId, UUID payrollRunId,
                                            UUID paySlipId, UUID employeeId,
                                            String employeeName,
                                            PaymentMethod paymentMethod,
                                            String phoneNumber, String bankName,
                                            String bankAccount,
                                            BigDecimal amount, String currency) {
        PaymentTransaction tx = new PaymentTransaction();
        tx.setTenantId(tenantId);
        tx.payrollRunId = payrollRunId;
        tx.paySlipId = paySlipId;
        tx.employeeId = employeeId;
        tx.employeeName = employeeName;
        tx.paymentMethod = paymentMethod;
        tx.phoneNumber = phoneNumber;
        tx.bankName = bankName;
        tx.bankAccount = bankAccount;
        tx.amount = amount;
        tx.currency = currency;
        tx.status = TransactionStatus.PENDING;
        return tx;
    }

    public void markSubmitted(String externalReference, String conversationId) {
        this.status = TransactionStatus.SUBMITTED;
        this.externalReference = externalReference;
        this.conversationId = conversationId;
        this.submittedAt = Instant.now();
    }

    public void markProcessing() {
        this.status = TransactionStatus.PROCESSING;
    }

    public void markCompleted(String providerReceipt) {
        this.status = TransactionStatus.COMPLETED;
        this.providerReceipt = providerReceipt;
        this.completedAt = Instant.now();
    }

    public void markFailed(String errorCode, String errorMessage) {
        this.status = TransactionStatus.FAILED;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.retryCount++;
    }

    public void markTimeout() {
        this.status = TransactionStatus.TIMEOUT;
        this.retryCount++;
    }

    public boolean canRetry() {
        return retryCount < 3
                && (status == TransactionStatus.FAILED || status == TransactionStatus.TIMEOUT);
    }
}
