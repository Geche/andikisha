package com.andikisha.tenant.domain.model;

import com.andikisha.common.domain.model.LicenceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Append-only audit trail for licence status transitions.
 * Intentionally does NOT extend BaseEntity:
 *  - history rows are immutable (no @Version, no updated_at)
 *  - tenant_id is captured directly so that history outlives any licence row
 *  - no soft-delete, no last-modified — every change is a new row
 */
@Entity
@Table(name = "licence_history")
public class LicenceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "licence_id", nullable = false)
    private UUID licenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false, length = 30)
    private LicenceStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private LicenceStatus newStatus;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    protected LicenceHistory() {}

    public static LicenceHistory record(String tenantId,
                                        UUID licenceId,
                                        LicenceStatus previousStatus,
                                        LicenceStatus newStatus,
                                        String changedBy,
                                        String changeReason) {
        LicenceHistory history = new LicenceHistory();
        history.tenantId = tenantId;
        history.licenceId = licenceId;
        history.previousStatus = previousStatus;
        history.newStatus = newStatus;
        history.changedBy = changedBy;
        history.changeReason = changeReason;
        history.changedAt = LocalDateTime.now();
        return history;
    }

    public UUID getId() { return id; }
    public String getTenantId() { return tenantId; }
    public UUID getLicenceId() { return licenceId; }
    public LicenceStatus getPreviousStatus() { return previousStatus; }
    public LicenceStatus getNewStatus() { return newStatus; }
    public String getChangedBy() { return changedBy; }
    public String getChangeReason() { return changeReason; }
    public LocalDateTime getChangedAt() { return changedAt; }
}
