package com.andikisha.recruitment.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.CreatePipelineTemplateRequest;
import com.andikisha.recruitment.application.dto.request.StageInputRequest;
import com.andikisha.recruitment.application.dto.request.UpdatePipelineTemplateRequest;
import com.andikisha.recruitment.application.dto.response.PipelineTemplateResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.domain.model.PipelineStage;
import com.andikisha.recruitment.domain.model.PipelineTemplate;
import com.andikisha.recruitment.domain.model.StageCategory;
import com.andikisha.recruitment.domain.repository.ApplicantRepository;
import com.andikisha.recruitment.domain.repository.JobPostingRepository;
import com.andikisha.recruitment.domain.repository.PipelineTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PipelineTemplateService {

    private final PipelineTemplateRepository templateRepository;
    private final JobPostingRepository postingRepository;
    private final ApplicantRepository applicantRepository;
    private final RecruitmentMapper mapper;

    public PipelineTemplateService(PipelineTemplateRepository templateRepository,
                                   JobPostingRepository postingRepository,
                                   ApplicantRepository applicantRepository,
                                   RecruitmentMapper mapper) {
        this.templateRepository = templateRepository;
        this.postingRepository = postingRepository;
        this.applicantRepository = applicantRepository;
        this.mapper = mapper;
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    /** Lists templates; lazily seeds the tenant default on first access (hence read-write). */
    @Transactional
    public List<PipelineTemplateResponse> listTemplates() {
        String tenantId = TenantContext.requireTenantId();
        ensureDefaultTemplate(tenantId);
        return templateRepository.findByTenantIdOrderByNameAsc(tenantId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Seeds the default six-stage hiring pipeline the first time a tenant touches recruitment.
     * Idempotent: only creates a template when the tenant has none at all. Called from the
     * template list AND from posting creation so a tenant that never opens settings still has a
     * working pipeline.
     */
    @Transactional
    public void ensureDefaultTemplate(String tenantId) {
        if (templateRepository.existsByTenantId(tenantId)) {
            return;
        }
        PipelineTemplate template = PipelineTemplate.create(tenantId, "Default hiring pipeline");
        int i = 0;
        template.addStage(PipelineStage.create(tenantId, i++, "Applied", StageCategory.APPLIED));
        template.addStage(PipelineStage.create(tenantId, i++, "Screening", StageCategory.INTERMEDIATE));
        template.addStage(PipelineStage.create(tenantId, i++, "Interview", StageCategory.INTERMEDIATE));
        template.addStage(PipelineStage.create(tenantId, i++, "Offer", StageCategory.OFFER));
        template.addStage(PipelineStage.create(tenantId, i++, "Hired", StageCategory.HIRED));
        template.addStage(PipelineStage.create(tenantId, i, "Rejected", StageCategory.REJECTED));
        templateRepository.save(template);
    }

    // ── Writes ───────────────────────────────────────────────────────────────

    @Transactional
    public PipelineTemplateResponse createTemplate(CreatePipelineTemplateRequest request) {
        String tenantId = TenantContext.requireTenantId();
        PipelineTemplate template = PipelineTemplate.create(tenantId, request.name());

        List<PipelineStage> stages = new ArrayList<>();
        for (StageInputRequest in : request.stages()) {
            stages.add(PipelineStage.create(tenantId, 0, in.name(), parseCategory(in.category())));
        }
        orderAndValidate(stages);
        stages.forEach(template::addStage);

        return mapper.toResponse(templateRepository.save(template));
    }

    /**
     * Updates a template by diffing the incoming stage list against the existing stages IN PLACE
     * (stage ids survive so applicants' currentStageId pointers stay valid). Enforces the anchor
     * guards before any mutation.
     */
    @Transactional
    public PipelineTemplateResponse updateTemplate(UUID templateId,
                                                   UpdatePipelineTemplateRequest request) {
        String tenantId = TenantContext.requireTenantId();
        PipelineTemplate template = templateRepository.findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TEMPLATE_NOT_FOUND",
                        "Pipeline template not found: " + templateId));

        List<PipelineStage> existing = new ArrayList<>(template.getStages());
        Map<UUID, PipelineStage> existingById = existing.stream()
                .collect(Collectors.toMap(PipelineStage::getId, Function.identity()));
        List<UUID> incomingIds = request.stages().stream()
                .map(StageInputRequest::id)
                .filter(java.util.Objects::nonNull)
                .toList();

        // Guard 1: removals. An anchor may never be removed; a non-anchor holding applicants may not.
        for (PipelineStage s : existing) {
            if (incomingIds.contains(s.getId())) {
                continue;
            }
            if (s.isProtected()) {
                throw new BusinessRuleException("ANCHOR_STAGE_PROTECTED",
                        "The " + s.getCategory() + " stage cannot be removed");
            }
            if (applicantRepository.existsByTenantIdAndCurrentStageId(tenantId, s.getId())) {
                throw new BusinessRuleException("STAGE_HAS_APPLICANTS",
                        "Move applicants before deleting this stage");
            }
        }

        // Guard 2: category changes on matched anchors (semantic rename).
        for (StageInputRequest in : request.stages()) {
            if (in.id() == null) {
                continue;
            }
            PipelineStage match = existingById.get(in.id());
            if (match == null) {
                throw new BusinessRuleException("STAGE_NOT_IN_PIPELINE",
                        "Stage " + in.id() + " does not belong to this template");
            }
            StageCategory newCategory = parseCategory(in.category());
            if (match.isProtected() && newCategory != match.getCategory()) {
                throw new BusinessRuleException("ANCHOR_CATEGORY_PROTECTED",
                        "The " + match.getCategory() + " stage category cannot be changed");
            }
        }

        // Guards passed — apply. Rename template, drop orphans, relabel/recategorise survivors,
        // add new stages, then re-order per the invariants.
        template.rename(request.name());
        template.getStages().removeIf(s -> !incomingIds.contains(s.getId()));

        List<PipelineStage> ordered = new ArrayList<>();
        for (StageInputRequest in : request.stages()) {
            StageCategory category = parseCategory(in.category());
            if (in.id() != null) {
                PipelineStage stage = existingById.get(in.id());
                stage.relabel(in.name());
                if (!stage.isProtected()) {
                    stage.changeCategory(category);
                }
                ordered.add(stage);
            } else {
                PipelineStage created = PipelineStage.create(tenantId, 0, in.name(), category);
                template.addStage(created);
                ordered.add(created);
            }
        }
        orderAndValidate(ordered);

        return mapper.toResponse(templateRepository.save(template));
    }

    @Transactional
    public void deactivateTemplate(UUID templateId) {
        String tenantId = TenantContext.requireTenantId();
        PipelineTemplate template = templateRepository.findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TEMPLATE_NOT_FOUND",
                        "Pipeline template not found: " + templateId));
        if (postingRepository.existsByTenantIdAndPipelineTemplateId(tenantId, templateId)) {
            throw new BusinessRuleException("TEMPLATE_IN_USE",
                    "This template is referenced by a job posting and cannot be deactivated");
        }
        template.deactivate();
        templateRepository.save(template);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Enforces the structural invariants and rewrites orderIndex on each stage:
     * exactly one APPLIED (first), exactly one HIRED and one REJECTED (terminal, last two),
     * everything else in the given order between them.
     */
    private void orderAndValidate(List<PipelineStage> stages) {
        List<PipelineStage> applied = stages.stream()
                .filter(s -> s.getCategory() == StageCategory.APPLIED).toList();
        List<PipelineStage> hired = stages.stream()
                .filter(s -> s.getCategory() == StageCategory.HIRED).toList();
        List<PipelineStage> rejected = stages.stream()
                .filter(s -> s.getCategory() == StageCategory.REJECTED).toList();
        if (applied.size() != 1 || hired.size() != 1 || rejected.size() != 1) {
            throw new BusinessRuleException("INVALID_PIPELINE",
                    "A pipeline must have exactly one APPLIED, one HIRED and one REJECTED stage");
        }

        List<PipelineStage> middles = stages.stream()
                .filter(s -> !s.getCategory().isAnchor())
                .toList();

        List<PipelineStage> finalOrder = new ArrayList<>();
        finalOrder.add(applied.get(0));
        finalOrder.addAll(middles);
        finalOrder.add(hired.get(0));
        finalOrder.add(rejected.get(0));

        for (int i = 0; i < finalOrder.size(); i++) {
            finalOrder.get(i).setOrderIndex(i);
        }
    }

    private static StageCategory parseCategory(String value) {
        try {
            return StageCategory.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessRuleException("INVALID_ENUM_VALUE",
                    "Invalid stage category '" + value + "'");
        }
    }
}
