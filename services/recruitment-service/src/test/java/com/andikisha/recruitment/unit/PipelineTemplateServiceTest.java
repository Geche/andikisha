package com.andikisha.recruitment.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.StageInputRequest;
import com.andikisha.recruitment.application.dto.request.UpdatePipelineTemplateRequest;
import com.andikisha.recruitment.application.dto.response.PipelineStageResponse;
import com.andikisha.recruitment.application.dto.response.PipelineTemplateResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.application.service.PipelineTemplateService;
import com.andikisha.recruitment.domain.model.PipelineStage;
import com.andikisha.recruitment.domain.model.PipelineTemplate;
import com.andikisha.recruitment.domain.model.StageCategory;
import com.andikisha.recruitment.domain.repository.ApplicantRepository;
import com.andikisha.recruitment.domain.repository.JobPostingRepository;
import com.andikisha.recruitment.domain.repository.PipelineTemplateRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PipelineTemplateServiceTest {

    @Mock private PipelineTemplateRepository templateRepository;
    @Mock private JobPostingRepository postingRepository;
    @Mock private ApplicantRepository applicantRepository;

    private PipelineTemplateService service;

    private static final String TENANT_ID = "test-tenant";

    @BeforeEach
    void setUp() {
        service = new PipelineTemplateService(
                templateRepository, postingRepository, applicantRepository, new RecruitmentMapper());
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── 1. Default template seeding ─────────────────────────────────────────────

    @Test
    void ensureDefaultTemplate_seedsSixStagesInOrderWithCategories() {
        when(templateRepository.existsByTenantId(TENANT_ID)).thenReturn(false);
        when(templateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.ensureDefaultTemplate(TENANT_ID);

        ArgumentCaptor<PipelineTemplate> captor = ArgumentCaptor.forClass(PipelineTemplate.class);
        verify(templateRepository).save(captor.capture());
        PipelineTemplate seeded = captor.getValue();

        assertThat(seeded.getName()).isEqualTo("Default hiring pipeline");
        assertThat(seeded.getStages()).extracting(PipelineStage::getName)
                .containsExactly("Applied", "Screening", "Interview", "Offer", "Hired", "Rejected");
        assertThat(seeded.getStages()).extracting(PipelineStage::getCategory)
                .containsExactly(StageCategory.APPLIED, StageCategory.INTERMEDIATE,
                        StageCategory.INTERMEDIATE, StageCategory.OFFER,
                        StageCategory.HIRED, StageCategory.REJECTED);
        assertThat(seeded.getStages()).extracting(PipelineStage::getOrderIndex)
                .containsExactly(0, 1, 2, 3, 4, 5);
    }

    @Test
    void ensureDefaultTemplate_isIdempotent_doesNotDuplicate() {
        when(templateRepository.existsByTenantId(TENANT_ID)).thenReturn(true);

        service.ensureDefaultTemplate(TENANT_ID);

        verify(templateRepository, never()).save(any());
    }

    // ── 2. Anchor protection ─────────────────────────────────────────────────────

    @Test
    void updateTemplate_removingAppliedStage_throwsAnchorProtected() {
        Fixture f = fixtureTemplate();
        assertThatThrownBy(() -> service.updateTemplate(f.templateId,
                        requestOmitting(f, StageCategory.APPLIED)))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("ANCHOR_STAGE_PROTECTED"));
    }

    @Test
    void updateTemplate_removingHiredStage_throwsAnchorProtected() {
        Fixture f = fixtureTemplate();
        assertThatThrownBy(() -> service.updateTemplate(f.templateId,
                        requestOmitting(f, StageCategory.HIRED)))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("ANCHOR_STAGE_PROTECTED"));
    }

    @Test
    void updateTemplate_removingRejectedStage_throwsAnchorProtected() {
        Fixture f = fixtureTemplate();
        assertThatThrownBy(() -> service.updateTemplate(f.templateId,
                        requestOmitting(f, StageCategory.REJECTED)))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("ANCHOR_STAGE_PROTECTED"));
    }

    @Test
    void updateTemplate_changingHiredCategory_throwsAnchorCategoryProtected() {
        Fixture f = fixtureTemplate();
        assertThatThrownBy(() -> service.updateTemplate(f.templateId,
                        requestRecategorising(f, StageCategory.HIRED, "INTERMEDIATE")))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("ANCHOR_CATEGORY_PROTECTED"));
    }

    @Test
    void updateTemplate_changingRejectedCategory_throwsAnchorCategoryProtected() {
        Fixture f = fixtureTemplate();
        assertThatThrownBy(() -> service.updateTemplate(f.templateId,
                        requestRecategorising(f, StageCategory.REJECTED, "OFFER")))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("ANCHOR_CATEGORY_PROTECTED"));
    }

    @Test
    void updateTemplate_relabellingAnchor_succeeds() {
        Fixture f = fixtureTemplate();
        when(templateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Rename the HIRED anchor's display label only (category unchanged).
        List<StageInputRequest> inputs = new ArrayList<>();
        for (PipelineStage s : f.template.getStages()) {
            String name = s.getCategory() == StageCategory.HIRED ? "Onboarded" : s.getName();
            inputs.add(new StageInputRequest(s.getId(), name, s.getCategory().name()));
        }

        PipelineTemplateResponse response = service.updateTemplate(
                f.templateId, new UpdatePipelineTemplateRequest("Custom pipeline", inputs));

        PipelineStageResponse hired = response.stages().stream()
                .filter(st -> st.category().equals("HIRED")).findFirst().orElseThrow();
        assertThat(hired.name()).isEqualTo("Onboarded");
        assertThat(hired.isProtected()).isTrue();
    }

    // ── 5. Stage-has-applicants guard ────────────────────────────────────────────

    @Test
    void updateTemplate_deletingStageHoldingApplicants_throwsStageHasApplicants() {
        Fixture f = fixtureTemplate();
        UUID screeningId = f.idOf(StageCategory.INTERMEDIATE); // the "Screening" stage
        when(applicantRepository.existsByTenantIdAndCurrentStageId(TENANT_ID, screeningId))
                .thenReturn(true);

        assertThatThrownBy(() -> service.updateTemplate(f.templateId, requestOmittingId(f, screeningId)))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("STAGE_HAS_APPLICANTS"));
    }

    // ── Fixtures ─────────────────────────────────────────────────────────────────

    private Fixture fixtureTemplate() {
        PipelineTemplate template = PipelineTemplate.create(TENANT_ID, "Default hiring pipeline");
        addStage(template, 0, "Applied", StageCategory.APPLIED);
        addStage(template, 1, "Screening", StageCategory.INTERMEDIATE);
        addStage(template, 2, "Interview", StageCategory.INTERMEDIATE);
        addStage(template, 3, "Offer", StageCategory.OFFER);
        addStage(template, 4, "Hired", StageCategory.HIRED);
        addStage(template, 5, "Rejected", StageCategory.REJECTED);
        UUID templateId = UUID.randomUUID();
        ReflectionTestUtils.setField(template, "id", templateId);
        when(templateRepository.findByIdAndTenantId(templateId, TENANT_ID))
                .thenReturn(Optional.of(template));
        return new Fixture(template, templateId);
    }

    private static void addStage(PipelineTemplate template, int order, String name, StageCategory cat) {
        PipelineStage stage = PipelineStage.create(TENANT_ID, order, name, cat);
        ReflectionTestUtils.setField(stage, "id", UUID.randomUUID());
        template.addStage(stage);
    }

    /** Full incoming stage list minus the first stage of the given category (a removal). */
    private static UpdatePipelineTemplateRequest requestOmitting(Fixture f, StageCategory omit) {
        return requestOmittingId(f, f.idOf(omit));
    }

    private static UpdatePipelineTemplateRequest requestOmittingId(Fixture f, UUID omitId) {
        List<StageInputRequest> inputs = new ArrayList<>();
        for (PipelineStage s : f.template.getStages()) {
            if (s.getId().equals(omitId)) continue;
            inputs.add(new StageInputRequest(s.getId(), s.getName(), s.getCategory().name()));
        }
        return new UpdatePipelineTemplateRequest("Custom pipeline", inputs);
    }

    /** Full incoming stage list with the given anchor's category swapped (a semantic rename). */
    private static UpdatePipelineTemplateRequest requestRecategorising(Fixture f, StageCategory target,
                                                                       String newCategory) {
        List<StageInputRequest> inputs = new ArrayList<>();
        for (PipelineStage s : f.template.getStages()) {
            String category = s.getCategory() == target ? newCategory : s.getCategory().name();
            inputs.add(new StageInputRequest(s.getId(), s.getName(), category));
        }
        return new UpdatePipelineTemplateRequest("Custom pipeline", inputs);
    }

    private record Fixture(PipelineTemplate template, UUID templateId) {
        UUID idOf(StageCategory category) {
            return template.getStages().stream()
                    .filter(s -> s.getCategory() == category)
                    .map(PipelineStage::getId)
                    .findFirst().orElseThrow();
        }
    }
}
