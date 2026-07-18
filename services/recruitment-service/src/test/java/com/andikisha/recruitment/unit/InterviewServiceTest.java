package com.andikisha.recruitment.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.SubmitFeedbackRequest;
import com.andikisha.recruitment.application.dto.response.FeedbackResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.application.service.InterviewService;
import com.andikisha.recruitment.domain.model.Interview;
import com.andikisha.recruitment.domain.model.InterviewMode;
import com.andikisha.recruitment.domain.repository.InterviewFeedbackRepository;
import com.andikisha.recruitment.domain.repository.InterviewRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock private InterviewRepository interviewRepository;
    @Mock private InterviewFeedbackRepository feedbackRepository;

    private InterviewService service;

    private static final String TENANT_ID = "test-tenant";

    private UUID interviewId;
    private UUID interviewerId;
    private Interview interview;

    @BeforeEach
    void setUp() {
        service = new InterviewService(interviewRepository, feedbackRepository, new RecruitmentMapper());
        TenantContext.setTenantId(TENANT_ID);

        interviewId = UUID.randomUUID();
        interviewerId = UUID.randomUUID();
        interview = Interview.create(TENANT_ID, UUID.randomUUID(), Instant.now(),
                interviewerId, InterviewMode.VIDEO, null);
        ReflectionTestUtils.setField(interview, "id", interviewId);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void submitFeedback_byAssignedInterviewer_succeeds() {
        when(interviewRepository.findByIdAndTenantId(interviewId, TENANT_ID))
                .thenReturn(Optional.of(interview));
        when(feedbackRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FeedbackResponse response = service.submitFeedback(interviewId, interviewerId,
                new SubmitFeedbackRequest(4, "YES", "Solid systems knowledge"));

        assertThat(response.submittedByEmployeeId()).isEqualTo(interviewerId);
        assertThat(response.rating()).isEqualTo(4);
        verify(feedbackRepository).save(any());
    }

    @Test
    void submitFeedback_byNonOwner_throwsNotOwner() {
        when(interviewRepository.findByIdAndTenantId(interviewId, TENANT_ID))
                .thenReturn(Optional.of(interview));
        UUID otherEmployee = UUID.randomUUID();

        assertThatThrownBy(() -> service.submitFeedback(interviewId, otherEmployee,
                        new SubmitFeedbackRequest(5, "STRONG_YES", "hijacked")))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("NOT_OWNER"));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void submitFeedback_withNoEmployeeContext_throwsNoEmployeeContext() {
        assertThatThrownBy(() -> service.submitFeedback(interviewId, null,
                        new SubmitFeedbackRequest(3, "NO", "n/a")))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("NO_EMPLOYEE_CONTEXT"));
        verify(feedbackRepository, never()).save(any());
    }
}
