package com.andikisha.events.recruitment;

import com.andikisha.events.BaseEvent;

/**
 * Emitted whenever an applicant's current-stage pointer moves. Carries both the stage ids
 * and their categories so downstream consumers (R2 offer/rejection flows) can react to a
 * transition into OFFER / HIRED / REJECTED without re-reading the pipeline. {@code fromStageId}
 * and {@code fromCategory} are null on the initial APPLIED placement.
 */
public class ApplicantStageChangedEvent extends BaseEvent {

    private String applicantId;
    private String jobPostingId;
    private String fromStageId;
    private String toStageId;
    private String fromCategory;
    private String toCategory;
    private String movedByUserId;

    public ApplicantStageChangedEvent(String tenantId, String applicantId, String jobPostingId,
                                      String fromStageId, String toStageId,
                                      String fromCategory, String toCategory,
                                      String movedByUserId) {
        super("recruitment.applicant.stage_changed", tenantId);
        this.applicantId = applicantId;
        this.jobPostingId = jobPostingId;
        this.fromStageId = fromStageId;
        this.toStageId = toStageId;
        this.fromCategory = fromCategory;
        this.toCategory = toCategory;
        this.movedByUserId = movedByUserId;
    }

    protected ApplicantStageChangedEvent() { super(); }

    public String getApplicantId() { return applicantId; }
    public String getJobPostingId() { return jobPostingId; }
    public String getFromStageId() { return fromStageId; }
    public String getToStageId() { return toStageId; }
    public String getFromCategory() { return fromCategory; }
    public String getToCategory() { return toCategory; }
    public String getMovedByUserId() { return movedByUserId; }
}
