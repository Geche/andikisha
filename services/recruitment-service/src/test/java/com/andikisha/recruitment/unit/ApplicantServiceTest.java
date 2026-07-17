package com.andikisha.recruitment.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.application.port.RecruitmentEventPublisher;
import com.andikisha.recruitment.application.service.ApplicantService;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicantServiceTest {

    @Mock private ApplicantRepository applicantRepository;
    @Mock private JobPostingRepository postingRepository;
    @Mock private PipelineTemplateRepository templateRepository;
    @Mock private StageTransitionRepository transitionRepository;
    @Mock private RecruitmentEventPublisher eventPublisher;

    private ApplicantService service;

    private static final String TENANT_ID = "test-tenant";

    private UUID appliedStageId;
    private UUID screeningStageId;
    private UUID postingId;
    private UUID applicantId;
    private Applicant applicant;

    @BeforeEach
    void setUp() {
        service = new ApplicantService(applicantRepository, postingRepository, templateRepository,
                transitionRepository, eventPublisher, new RecruitmentMapper());
        TenantContext.setTenantId(TENANT_ID);

        UUID templateId = UUID.randomUUID();
        PipelineTemplate template = PipelineTemplate.create(TENANT_ID, "Default hiring pipeline");
        PipelineStage applied = PipelineStage.create(TENANT_ID, 0, "Applied", StageCategory.APPLIED);
        PipelineStage screening = PipelineStage.create(TENANT_ID, 1, "Screening", StageCategory.INTERMEDIATE);
        appliedStageId = UUID.randomUUID();
        screeningStageId = UUID.randomUUID();
        ReflectionTestUtils.setField(applied, "id", appliedStageId);
        ReflectionTestUtils.setField(screening, "id", screeningStageId);
        template.addStage(applied);
        template.addStage(screening);
        ReflectionTestUtils.setField(template, "id", templateId);

        postingId = UUID.randomUUID();
        JobPosting posting = JobPosting.create(TENANT_ID, UUID.randomUUID(), templateId,
                "Backend Engineer", null, null, null);
        ReflectionTestUtils.setField(posting, "id", postingId);

        applicantId = UUID.randomUUID();
        applicant = Applicant.create(TENANT_ID, postingId, "Amina", "Otieno", "amina@example.com",
                null, null, null, null, null, appliedStageId, "referral");
        ReflectionTestUtils.setField(applicant, "id", applicantId);

        when(applicantRepository.findByIdAndTenantId(applicantId, TENANT_ID))
                .thenReturn(Optional.of(applicant));
        when(postingRepository.findByIdAndTenantId(postingId, TENANT_ID))
                .thenReturn(Optional.of(posting));
        when(templateRepository.findByIdAndTenantId(templateId, TENANT_ID))
                .thenReturn(Optional.of(template));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void moveStage_setsCurrentStagePointerAndAppendsTransition() {
        when(applicantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(transitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.moveStage(applicantId, screeningStageId, "user-1", "looks strong");

        // pointer moved
        assertThat(applicant.getCurrentStageId()).isEqualTo(screeningStageId);

        // exactly one StageTransition appended: from APPLIED → SCREENING by user-1
        ArgumentCaptor<StageTransition> captor = ArgumentCaptor.forClass(StageTransition.class);
        verify(transitionRepository).save(captor.capture());
        StageTransition transition = captor.getValue();
        assertThat(transition.getFromStageId()).isEqualTo(appliedStageId);
        assertThat(transition.getToStageId()).isEqualTo(screeningStageId);
        assertThat(transition.getMovedByUserId()).isEqualTo("user-1");
        assertThat(transition.getNote()).isEqualTo("looks strong");

        // event carries the from/to categories (no tx active → publishes immediately)
        verify(eventPublisher).publishApplicantStageChanged(any(), any(), any(), any());
    }

    @Test
    void moveStage_backwards_movesPointerBackAndRecordsRegressionTransition() {
        // The applicant is currently at SCREENING (a later stage than APPLIED).
        applicant.moveTo(screeningStageId);
        when(applicantRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(transitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Move BACK to APPLIED. The moving-pointer model is bidirectional — unlike L1's one-shot
        // OPEN->DONE tasks, a stage can be revisited, and the regression must be recorded.
        service.moveStage(applicantId, appliedStageId, "user-1", "sending back for re-screening");

        assertThat(applicant.getCurrentStageId()).isEqualTo(appliedStageId);

        ArgumentCaptor<StageTransition> captor = ArgumentCaptor.forClass(StageTransition.class);
        verify(transitionRepository).save(captor.capture());
        StageTransition transition = captor.getValue();
        assertThat(transition.getFromStageId()).isEqualTo(screeningStageId);
        assertThat(transition.getToStageId()).isEqualTo(appliedStageId);
        assertThat(transition.getMovedByUserId()).isEqualTo("user-1");
        assertThat(transition.getNote()).isEqualTo("sending back for re-screening");

        verify(eventPublisher).publishApplicantStageChanged(any(), any(), any(), any());
    }

    @Test
    void moveStage_toStageNotInPipeline_throwsStageNotInPipeline() {
        UUID foreignStageId = UUID.randomUUID();
        assertThatThrownBy(() -> service.moveStage(applicantId, foreignStageId, "user-1", null))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("STAGE_NOT_IN_PIPELINE"));
    }
}
