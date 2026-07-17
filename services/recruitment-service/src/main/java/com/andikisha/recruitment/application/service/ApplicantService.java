package com.andikisha.recruitment.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.CreateApplicantRequest;
import com.andikisha.recruitment.application.dto.response.ApplicantResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.application.port.RecruitmentEventPublisher;
import com.andikisha.recruitment.domain.model.Applicant;
import com.andikisha.recruitment.domain.model.JobPosting;
import com.andikisha.recruitment.domain.model.PipelineStage;
import com.andikisha.recruitment.domain.model.PipelineTemplate;
import com.andikisha.recruitment.domain.model.StageCategory;
import com.andikisha.recruitment.domain.model.StageTransition;
import com.andikisha.recruitment.domain.repository.ApplicantRepository;
import com.andikisha.recruitment.domain.repository.JobPostingRepository;
import com.andikisha.recruitment.domain.repository.PipelineTemplateRepository;
import com.andikisha.recruitment.domain.repository.StageTransitionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ApplicantService {

    private final ApplicantRepository applicantRepository;
    private final JobPostingRepository postingRepository;
    private final PipelineTemplateRepository templateRepository;
    private final StageTransitionRepository transitionRepository;
    private final RecruitmentEventPublisher eventPublisher;
    private final RecruitmentMapper mapper;

    public ApplicantService(ApplicantRepository applicantRepository,
                            JobPostingRepository postingRepository,
                            PipelineTemplateRepository templateRepository,
                            StageTransitionRepository transitionRepository,
                            RecruitmentEventPublisher eventPublisher,
                            RecruitmentMapper mapper) {
        this.applicantRepository = applicantRepository;
        this.postingRepository = postingRepository;
        this.templateRepository = templateRepository;
        this.transitionRepository = transitionRepository;
        this.eventPublisher = eventPublisher;
        this.mapper = mapper;
    }

    public List<ApplicantResponse> listByPosting(UUID postingId) {
        String tenantId = TenantContext.requireTenantId();
        return applicantRepository
                .findByTenantIdAndJobPostingIdOrderByAppliedAtAsc(tenantId, postingId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ApplicantResponse getApplicant(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        return applicantRepository.findByIdAndTenantId(id, tenantId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new BusinessRuleException("APPLICANT_NOT_FOUND",
                        "Applicant not found: " + id));
    }

    /**
     * Attaches an applicant to a posting at that posting's APPLIED stage, records the initial
     * transition (from=null → APPLIED) and publishes ApplicantAppliedEvent.
     */
    @Transactional
    public ApplicantResponse create(CreateApplicantRequest request, String movedByUserId) {
        String tenantId = TenantContext.requireTenantId();
        JobPosting posting = postingRepository.findByIdAndTenantId(request.jobPostingId(), tenantId)
                .orElseThrow(() -> new BusinessRuleException("POSTING_NOT_FOUND",
                        "Job posting not found: " + request.jobPostingId()));
        PipelineTemplate template = requireTemplate(tenantId, posting.getPipelineTemplateId());
        PipelineStage appliedStage = template.getStages().stream()
                .filter(s -> s.getCategory() == StageCategory.APPLIED)
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("NO_APPLIED_STAGE",
                        "Pipeline has no APPLIED stage"));

        Applicant applicant = Applicant.create(
                tenantId, request.jobPostingId(), request.firstName(), request.lastName(),
                request.email(), request.phoneNumber(), request.nationalId(), request.kraPin(),
                request.nhifNumber(), request.nssfNumber(), appliedStage.getId(), request.source());
        Applicant saved = applicantRepository.save(applicant);

        StageTransition transition = StageTransition.create(
                tenantId, saved.getId(), null, appliedStage.getId(), movedByUserId, null);
        transitionRepository.save(transition);

        UUID stageId = appliedStage.getId();
        publishAfterCommit(() -> eventPublisher.publishApplicantApplied(saved, stageId));
        return mapper.toResponse(saved);
    }

    /**
     * Moves an applicant to another stage of the SAME pipeline, appends a StageTransition and
     * publishes ApplicantStageChangedEvent carrying the from/to categories. In R1 moving into
     * HIRED/OFFER/REJECTED is just a stage change — no conversion or rejection side effects.
     */
    @Transactional
    public ApplicantResponse moveStage(UUID applicantId, UUID toStageId, String movedByUserId,
                                       String note) {
        String tenantId = TenantContext.requireTenantId();
        Applicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("APPLICANT_NOT_FOUND",
                        "Applicant not found: " + applicantId));
        JobPosting posting = postingRepository.findByIdAndTenantId(applicant.getJobPostingId(), tenantId)
                .orElseThrow(() -> new BusinessRuleException("POSTING_NOT_FOUND",
                        "Job posting not found: " + applicant.getJobPostingId()));
        PipelineTemplate template = requireTemplate(tenantId, posting.getPipelineTemplateId());

        PipelineStage toStage = template.getStages().stream()
                .filter(s -> s.getId().equals(toStageId))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("STAGE_NOT_IN_PIPELINE",
                        "Target stage does not belong to this applicant's pipeline"));

        UUID fromStageId = applicant.getCurrentStageId();
        String fromCategory = template.getStages().stream()
                .filter(s -> s.getId().equals(fromStageId))
                .map(s -> s.getCategory().name())
                .findFirst()
                .orElse(null);

        applicant.moveTo(toStageId);
        Applicant saved = applicantRepository.save(applicant);

        StageTransition transition = StageTransition.create(
                tenantId, applicantId, fromStageId, toStageId, movedByUserId, note);
        StageTransition savedTransition = transitionRepository.save(transition);

        UUID jobPostingId = posting.getId();
        String toCategory = toStage.getCategory().name();
        publishAfterCommit(() -> eventPublisher.publishApplicantStageChanged(
                savedTransition, jobPostingId, fromCategory, toCategory));
        return mapper.toResponse(saved);
    }

    private PipelineTemplate requireTemplate(String tenantId, UUID templateId) {
        return templateRepository.findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TEMPLATE_NOT_FOUND",
                        "Pipeline template not found: " + templateId));
    }

    private void publishAfterCommit(Runnable publishAction) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publishAction.run();
                }
            });
        } else {
            publishAction.run();
        }
    }
}
