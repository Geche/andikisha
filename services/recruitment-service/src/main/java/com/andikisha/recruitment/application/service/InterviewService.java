package com.andikisha.recruitment.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.CreateInterviewRequest;
import com.andikisha.recruitment.application.dto.request.SubmitFeedbackRequest;
import com.andikisha.recruitment.application.dto.response.FeedbackResponse;
import com.andikisha.recruitment.application.dto.response.InterviewResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.domain.model.FeedbackRecommendation;
import com.andikisha.recruitment.domain.model.Interview;
import com.andikisha.recruitment.domain.model.InterviewFeedback;
import com.andikisha.recruitment.domain.model.InterviewMode;
import com.andikisha.recruitment.domain.repository.InterviewFeedbackRepository;
import com.andikisha.recruitment.domain.repository.InterviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final RecruitmentMapper mapper;

    public InterviewService(InterviewRepository interviewRepository,
                            InterviewFeedbackRepository feedbackRepository,
                            RecruitmentMapper mapper) {
        this.interviewRepository = interviewRepository;
        this.feedbackRepository = feedbackRepository;
        this.mapper = mapper;
    }

    public List<InterviewResponse> listInterviews() {
        String tenantId = TenantContext.requireTenantId();
        return interviewRepository.findByTenantIdOrderByScheduledAtDesc(tenantId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public InterviewResponse getInterview(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        return interviewRepository.findByIdAndTenantId(id, tenantId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new BusinessRuleException("INTERVIEW_NOT_FOUND",
                        "Interview not found: " + id));
    }

    /** Interviews assigned to the caller (LINE_MANAGER self-service), resolved via X-Employee-ID. */
    public List<InterviewResponse> listMyInterviews(UUID callerEmployeeId) {
        String tenantId = TenantContext.requireTenantId();
        if (callerEmployeeId == null) {
            return List.of();
        }
        return interviewRepository
                .findByTenantIdAndInterviewerEmployeeIdOrderByScheduledAtDesc(tenantId, callerEmployeeId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public InterviewResponse createInterview(CreateInterviewRequest request) {
        String tenantId = TenantContext.requireTenantId();
        Interview interview = Interview.create(
                tenantId, request.applicantId(), request.scheduledAt(),
                request.interviewerEmployeeId(), parseMode(request.mode()), request.location());
        return mapper.toResponse(interviewRepository.save(interview));
    }

    /**
     * Form B ownership: the interview's assigned interviewer (interviewerEmployeeId) must equal the
     * caller's X-Employee-ID. Records feedback and marks the interview COMPLETED.
     */
    @Transactional
    public FeedbackResponse submitFeedback(UUID interviewId, UUID callerEmployeeId,
                                           SubmitFeedbackRequest request) {
        String tenantId = TenantContext.requireTenantId();
        if (callerEmployeeId == null) {
            throw new BusinessRuleException("NO_EMPLOYEE_CONTEXT",
                    "Only the assigned interviewer can submit feedback");
        }
        Interview interview = interviewRepository.findByIdAndTenantId(interviewId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("INTERVIEW_NOT_FOUND",
                        "Interview not found: " + interviewId));
        if (!callerEmployeeId.equals(interview.getInterviewerEmployeeId())) {
            throw new BusinessRuleException("NOT_OWNER",
                    "You can only submit feedback for interviews assigned to you");
        }

        InterviewFeedback feedback = InterviewFeedback.create(
                tenantId, interviewId, callerEmployeeId, request.rating(),
                parseRecommendation(request.recommendation()), request.comments());
        InterviewFeedback saved = feedbackRepository.save(feedback);
        interview.markCompleted();
        interviewRepository.save(interview);
        return mapper.toResponse(saved);
    }

    private static InterviewMode parseMode(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return InterviewMode.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_ENUM_VALUE", "Invalid interview mode '" + value + "'");
        }
    }

    private static FeedbackRecommendation parseRecommendation(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return FeedbackRecommendation.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_ENUM_VALUE", "Invalid recommendation '" + value + "'");
        }
    }
}
