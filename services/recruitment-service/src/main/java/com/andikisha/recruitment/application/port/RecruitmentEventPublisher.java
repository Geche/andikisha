package com.andikisha.recruitment.application.port;

import com.andikisha.recruitment.domain.model.Applicant;
import com.andikisha.recruitment.domain.model.JobPosting;
import com.andikisha.recruitment.domain.model.StageTransition;

/**
 * Outbound port for recruitment domain events. Publish-only in v1 (no in-service consumers).
 * Implemented by the RabbitMQ adapter in infrastructure/messaging.
 */
public interface RecruitmentEventPublisher {

    void publishApplicantApplied(Applicant applicant, java.util.UUID appliedStageId);

    /**
     * @param jobPostingId the posting the applicant belongs to
     * @param fromCategory the category name of the stage moved from, or null on initial placement
     * @param toCategory   the category name of the stage moved to
     */
    void publishApplicantStageChanged(StageTransition transition, java.util.UUID jobPostingId,
                                      String fromCategory, String toCategory);

    void publishJobPostingPublished(JobPosting posting);
}
