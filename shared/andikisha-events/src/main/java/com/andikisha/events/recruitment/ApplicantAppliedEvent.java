package com.andikisha.events.recruitment;

import com.andikisha.events.BaseEvent;

public class ApplicantAppliedEvent extends BaseEvent {

    private String applicantId;
    private String jobPostingId;
    private String appliedStageId;
    private String email;

    public ApplicantAppliedEvent(String tenantId, String applicantId, String jobPostingId,
                                 String appliedStageId, String email) {
        super("recruitment.applicant.applied", tenantId);
        this.applicantId = applicantId;
        this.jobPostingId = jobPostingId;
        this.appliedStageId = appliedStageId;
        this.email = email;
    }

    protected ApplicantAppliedEvent() { super(); }

    public String getApplicantId() { return applicantId; }
    public String getJobPostingId() { return jobPostingId; }
    public String getAppliedStageId() { return appliedStageId; }
    public String getEmail() { return email; }
}
