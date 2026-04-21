package com.andikisha.integration.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "filing_records")
public class FilingRecord extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "filing_type", nullable = false, length = 30)
    private IntegrationType filingType;

    @Column(nullable = false, length = 7)
    private String period;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    @Column(name = "employee_count", nullable = false)
    private int employeeCount;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "employer_amount", precision = 15, scale = 2)
    private BigDecimal employerAmount;

    @Column(name = "file_reference", length = 100)
    private String fileReference;

    @Column(name = "acknowledgment_number", length = 100)
    private String acknowledgmentNumber;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "filing_data", columnDefinition = "TEXT")
    private String filingData;

    protected FilingRecord() {}

    public static FilingRecord create(String tenantId, IntegrationType filingType,
                                      String period, int employeeCount,
                                      BigDecimal totalAmount, BigDecimal employerAmount) {
        FilingRecord r = new FilingRecord();
        r.setTenantId(tenantId);
        r.filingType = filingType;
        r.period = period;
        r.employeeCount = employeeCount;
        r.totalAmount = totalAmount;
        r.employerAmount = employerAmount;
        r.status = TransactionStatus.PENDING;
        return r;
    }

    public void markSubmitted(String fileReference) {
        this.status = TransactionStatus.SUBMITTED;
        this.fileReference = fileReference;
        this.submittedAt = Instant.now();
    }

    public void markConfirmed(String acknowledgmentNumber) {
        this.status = TransactionStatus.COMPLETED;
        this.acknowledgmentNumber = acknowledgmentNumber;
        this.confirmedAt = Instant.now();
    }

    public void markFailed(String error) {
        this.status = TransactionStatus.FAILED;
        this.errorMessage = error;
    }

    public void setFilingData(String data) { this.filingData = data; }

    public IntegrationType getFilingType() { return filingType; }
    public String getPeriod() { return period; }
    public TransactionStatus getStatus() { return status; }
    public int getEmployeeCount() { return employeeCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getEmployerAmount() { return employerAmount; }
    public String getFileReference() { return fileReference; }
    public String getAcknowledgmentNumber() { return acknowledgmentNumber; }
    public Instant getSubmittedAt() { return submittedAt; }
    public Instant getConfirmedAt() { return confirmedAt; }
    public String getErrorMessage() { return errorMessage; }
    public String getFilingData() { return filingData; }
}