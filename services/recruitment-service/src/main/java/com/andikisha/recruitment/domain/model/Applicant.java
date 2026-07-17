package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * A candidate who applied to a posting. Unlike a lifecycle instance, an applicant does NOT
 * materialise stages — it holds a single {@code currentStageId} pointer that moves through the
 * posting's pipeline. Stage history lives in append-only {@link StageTransition} rows.
 *
 * <p>Decision 1: all statutory IDs are nullable. National ID is collected at application; KRA /
 * SHIF / NSSF numbers are collected at onboarding (the R2 pending-activation conversion path).
 */
@Getter
@Entity
@Table(name = "applicant")
public class Applicant extends BaseEntity {

    @Column(name = "job_posting_id", nullable = false)
    private UUID jobPostingId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "national_id", length = 30)
    private String nationalId;

    @Column(name = "kra_pin", length = 30)
    private String kraPin;

    @Column(name = "nhif_number", length = 30)
    private String nhifNumber;

    @Column(name = "nssf_number", length = 30)
    private String nssfNumber;

    /** The moving pointer: the applicant's current stage in the posting's pipeline. */
    @Column(name = "current_stage_id", nullable = false)
    private UUID currentStageId;

    @Column(length = 100)
    private String source;

    @Column(name = "applied_at", nullable = false)
    private Instant appliedAt;

    protected Applicant() {}

    public static Applicant create(String tenantId, UUID jobPostingId, String firstName,
                                   String lastName, String email, String phoneNumber,
                                   String nationalId, String kraPin, String nhifNumber,
                                   String nssfNumber, UUID initialStageId, String source) {
        Applicant a = new Applicant();
        a.setTenantId(tenantId);
        a.jobPostingId = jobPostingId;
        a.firstName = firstName;
        a.lastName = lastName;
        a.email = email;
        a.phoneNumber = phoneNumber;
        a.nationalId = nationalId;
        a.kraPin = kraPin;
        a.nhifNumber = nhifNumber;
        a.nssfNumber = nssfNumber;
        a.currentStageId = initialStageId;
        a.source = source;
        a.appliedAt = Instant.now();
        return a;
    }

    /** Moves the current-stage pointer. Transition history is appended separately by the service. */
    public void moveTo(UUID stageId) {
        this.currentStageId = stageId;
    }
}
