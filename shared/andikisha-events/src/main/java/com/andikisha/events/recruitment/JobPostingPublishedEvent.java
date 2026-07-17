package com.andikisha.events.recruitment;

import com.andikisha.events.BaseEvent;

public class JobPostingPublishedEvent extends BaseEvent {

    private String jobPostingId;
    private String requisitionId;
    private String title;

    public JobPostingPublishedEvent(String tenantId, String jobPostingId,
                                    String requisitionId, String title) {
        super("recruitment.posting.published", tenantId);
        this.jobPostingId = jobPostingId;
        this.requisitionId = requisitionId;
        this.title = title;
    }

    protected JobPostingPublishedEvent() { super(); }

    public String getJobPostingId() { return jobPostingId; }
    public String getRequisitionId() { return requisitionId; }
    public String getTitle() { return title; }
}
