package com.andikisha.recruitment.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.CreatePostingRequest;
import com.andikisha.recruitment.application.dto.response.PostingResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.application.port.RecruitmentEventPublisher;
import com.andikisha.recruitment.domain.model.JobPosting;
import com.andikisha.recruitment.domain.model.PipelineTemplate;
import com.andikisha.recruitment.domain.repository.JobPostingRepository;
import com.andikisha.recruitment.domain.repository.JobRequisitionRepository;
import com.andikisha.recruitment.domain.repository.PipelineTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PostingService {

    private final JobPostingRepository postingRepository;
    private final JobRequisitionRepository requisitionRepository;
    private final PipelineTemplateRepository templateRepository;
    private final PipelineTemplateService pipelineTemplateService;
    private final RecruitmentEventPublisher eventPublisher;
    private final RecruitmentMapper mapper;

    public PostingService(JobPostingRepository postingRepository,
                          JobRequisitionRepository requisitionRepository,
                          PipelineTemplateRepository templateRepository,
                          PipelineTemplateService pipelineTemplateService,
                          RecruitmentEventPublisher eventPublisher,
                          RecruitmentMapper mapper) {
        this.postingRepository = postingRepository;
        this.requisitionRepository = requisitionRepository;
        this.templateRepository = templateRepository;
        this.pipelineTemplateService = pipelineTemplateService;
        this.eventPublisher = eventPublisher;
        this.mapper = mapper;
    }

    public List<PostingResponse> listPostings() {
        String tenantId = TenantContext.requireTenantId();
        return postingRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PostingResponse getPosting(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        return postingRepository.findByIdAndTenantId(id, tenantId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new BusinessRuleException("POSTING_NOT_FOUND",
                        "Job posting not found: " + id));
    }

    @Transactional
    public PostingResponse createPosting(CreatePostingRequest request) {
        String tenantId = TenantContext.requireTenantId();
        // Guarantee the tenant has a working pipeline even if they never opened settings.
        pipelineTemplateService.ensureDefaultTemplate(tenantId);

        requisitionRepository.findByIdAndTenantId(request.requisitionId(), tenantId)
                .orElseThrow(() -> new BusinessRuleException("REQUISITION_NOT_FOUND",
                        "Requisition not found: " + request.requisitionId()));

        PipelineTemplate template = templateRepository
                .findByIdAndTenantId(request.pipelineTemplateId(), tenantId)
                .orElseThrow(() -> new BusinessRuleException("TEMPLATE_NOT_FOUND",
                        "Pipeline template not found: " + request.pipelineTemplateId()));
        if (!template.isActive()) {
            throw new BusinessRuleException("TEMPLATE_INACTIVE",
                    "Cannot post against an inactive pipeline template");
        }

        JobPosting posting = JobPosting.create(
                tenantId, request.requisitionId(), request.pipelineTemplateId(), request.title(),
                request.description(), request.location(), request.closingDate());
        return mapper.toResponse(postingRepository.save(posting));
    }

    @Transactional
    public PostingResponse publishPosting(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        JobPosting posting = postingRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new BusinessRuleException("POSTING_NOT_FOUND",
                        "Job posting not found: " + id));
        posting.publish();
        JobPosting saved = postingRepository.save(posting);
        publishAfterCommit(() -> eventPublisher.publishJobPostingPublished(saved));
        return mapper.toResponse(saved);
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
