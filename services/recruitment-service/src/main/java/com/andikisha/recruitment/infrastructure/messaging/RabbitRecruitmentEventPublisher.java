package com.andikisha.recruitment.infrastructure.messaging;

import com.andikisha.events.recruitment.ApplicantAppliedEvent;
import com.andikisha.events.recruitment.ApplicantStageChangedEvent;
import com.andikisha.events.recruitment.JobPostingPublishedEvent;
import com.andikisha.recruitment.application.port.RecruitmentEventPublisher;
import com.andikisha.recruitment.domain.model.Applicant;
import com.andikisha.recruitment.domain.model.JobPosting;
import com.andikisha.recruitment.domain.model.StageTransition;
import com.andikisha.recruitment.infrastructure.config.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class RabbitRecruitmentEventPublisher implements RecruitmentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitRecruitmentEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public RabbitRecruitmentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishApplicantApplied(Applicant applicant, UUID appliedStageId) {
        var event = new ApplicantAppliedEvent(
                applicant.getTenantId(),
                applicant.getId().toString(),
                applicant.getJobPostingId().toString(),
                appliedStageId != null ? appliedStageId.toString() : null,
                applicant.getEmail());
        send("recruitment.applicant.applied", event, applicant.getId().toString());
    }

    @Override
    public void publishApplicantStageChanged(StageTransition transition, UUID jobPostingId,
                                             String fromCategory, String toCategory) {
        var event = new ApplicantStageChangedEvent(
                transition.getTenantId(),
                transition.getApplicantId().toString(),
                jobPostingId != null ? jobPostingId.toString() : null,
                transition.getFromStageId() != null ? transition.getFromStageId().toString() : null,
                transition.getToStageId().toString(),
                fromCategory,
                toCategory,
                transition.getMovedByUserId());
        send("recruitment.applicant.stage_changed", event, transition.getApplicantId().toString());
    }

    @Override
    public void publishJobPostingPublished(JobPosting posting) {
        var event = new JobPostingPublishedEvent(
                posting.getTenantId(),
                posting.getId().toString(),
                posting.getRequisitionId().toString(),
                posting.getTitle());
        send("recruitment.posting.published", event, posting.getId().toString());
    }

    /**
     * Sends to the recruitment topic exchange. Services already invoke publishers from an
     * afterCommit() callback, so no TransactionSynchronization is nested here (mirrors
     * employee-service's RabbitEmployeeEventPublisher).
     */
    private void send(String routingKey, Object event, String refId) {
        try {
            rabbitTemplate.convertAndSend(RabbitMqConfig.RECRUITMENT_EXCHANGE, routingKey, event);
            log.info("Published {} for {}", routingKey, refId);
        } catch (Exception e) {
            log.error("Failed to publish {} for {}", routingKey, refId, e);
        }
    }
}
