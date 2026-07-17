package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * Append-only history of an applicant's stage moves — one row per move. {@code fromStageId} is
 * null on the initial APPLIED placement.
 */
@Getter
@Entity
@Table(name = "stage_transition")
public class StageTransition extends BaseEntity {

    @Column(name = "applicant_id", nullable = false)
    private UUID applicantId;

    @Column(name = "from_stage_id")
    private UUID fromStageId;

    @Column(name = "to_stage_id", nullable = false)
    private UUID toStageId;

    @Column(name = "moved_by_user_id", nullable = false, length = 100)
    private String movedByUserId;

    @Column(length = 1000)
    private String note;

    @Column(name = "moved_at", nullable = false)
    private Instant movedAt;

    protected StageTransition() {}

    public static StageTransition create(String tenantId, UUID applicantId, UUID fromStageId,
                                         UUID toStageId, String movedByUserId, String note) {
        StageTransition t = new StageTransition();
        t.setTenantId(tenantId);
        t.applicantId = applicantId;
        t.fromStageId = fromStageId;
        t.toStageId = toStageId;
        t.movedByUserId = movedByUserId;
        t.note = note;
        t.movedAt = Instant.now();
        return t;
    }
}
