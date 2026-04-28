package com.andikisha.tenant.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.domain.model.BillingCycle;
import com.andikisha.common.domain.model.LicenceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate root representing a tenant's active or historical licence.
 * One tenant may have multiple licence rows over time (renewals create new rows).
 * The current licence is the most recent row whose status is not CANCELLED/EXPIRED.
 *
 * Cross-service note: planId is a UUID reference to plans.id (no DB FK enforced —
 * other services treat plan only by name through gRPC).
 */
@Entity
@Table(name = "tenant_licence")
public class TenantLicence extends BaseEntity {

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "licence_key", nullable = false, unique = true)
    private UUID licenceKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 20)
    private BillingCycle billingCycle;

    @Column(name = "seat_count", nullable = false)
    private int seatCount;

    @Column(name = "agreed_price_kes", nullable = false, precision = 19, scale = 4)
    private BigDecimal agreedPriceKes;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "KES";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private LicenceStatus status;

    @Column(name = "suspended_at")
    private LocalDateTime suspendedAt;

    @Column(name = "cancelled_reason", columnDefinition = "TEXT")
    private String cancelledReason;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    protected TenantLicence() {}

    public static TenantLicence create(String tenantId,
                                       UUID planId,
                                       BillingCycle billingCycle,
                                       int seatCount,
                                       BigDecimal agreedPriceKes,
                                       LocalDate startDate,
                                       LocalDate endDate,
                                       LicenceStatus status,
                                       String createdBy) {
        TenantLicence licence = new TenantLicence();
        licence.setTenantId(tenantId);
        licence.setPlanId(planId);
        licence.licenceKey = UUID.randomUUID();
        licence.setBillingCycle(billingCycle);
        licence.setSeatCount(seatCount);
        licence.setAgreedPriceKes(agreedPriceKes);
        licence.currency = "KES";
        licence.startDate = startDate;
        licence.setEndDate(endDate);
        licence.changeStatus(status);
        licence.createdBy = createdBy;
        return licence;
    }

    public void changeStatus(LicenceStatus newStatus) {
        this.status = newStatus;
    }

    public void markSuspendedAt(LocalDateTime when) {
        this.suspendedAt = when;
    }

    public void clearSuspendedAt() {
        this.suspendedAt = null;
    }

    public void setCancelledReason(String cancelledReason) {
        this.cancelledReason = cancelledReason;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public void setPlanId(UUID planId) {
        this.planId = planId;
    }

    public void setSeatCount(int seatCount) {
        this.seatCount = seatCount;
    }

    public void setAgreedPriceKes(BigDecimal agreedPriceKes) {
        this.agreedPriceKes = agreedPriceKes;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setBillingCycle(BillingCycle billingCycle) {
        this.billingCycle = billingCycle;
    }

    public UUID getPlanId() { return planId; }
    public UUID getLicenceKey() { return licenceKey; }
    public BillingCycle getBillingCycle() { return billingCycle; }
    public int getSeatCount() { return seatCount; }
    public BigDecimal getAgreedPriceKes() { return agreedPriceKes; }
    public String getCurrency() { return currency; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public LicenceStatus getStatus() { return status; }
    public LocalDateTime getSuspendedAt() { return suspendedAt; }
    public String getCancelledReason() { return cancelledReason; }
    public String getCreatedBy() { return createdBy; }
    public String getLastModifiedBy() { return lastModifiedBy; }
}
