package com.andikisha.recruitment.application.mapper;

import com.andikisha.common.domain.Money;
import com.andikisha.recruitment.application.dto.response.ApplicantResponse;
import com.andikisha.recruitment.application.dto.response.FeedbackResponse;
import com.andikisha.recruitment.application.dto.response.InterviewResponse;
import com.andikisha.recruitment.application.dto.response.MoneyResponse;
import com.andikisha.recruitment.application.dto.response.PipelineStageResponse;
import com.andikisha.recruitment.application.dto.response.PipelineTemplateResponse;
import com.andikisha.recruitment.application.dto.response.PostingResponse;
import com.andikisha.recruitment.application.dto.response.RequisitionResponse;
import com.andikisha.recruitment.application.dto.response.StageTransitionResponse;
import com.andikisha.recruitment.domain.model.Applicant;
import com.andikisha.recruitment.domain.model.Interview;
import com.andikisha.recruitment.domain.model.InterviewFeedback;
import com.andikisha.recruitment.domain.model.JobPosting;
import com.andikisha.recruitment.domain.model.JobRequisition;
import com.andikisha.recruitment.domain.model.PipelineStage;
import com.andikisha.recruitment.domain.model.PipelineTemplate;
import com.andikisha.recruitment.domain.model.StageTransition;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Manual mapping — the nested ordered stage collection and the {@code Money → MoneyResponse}
 * conversions make MapStruct awkward, and the services already assemble the aggregates
 * (mirrors employee-service's LifecycleMapper).
 */
@Component
public class RecruitmentMapper {

    public PipelineTemplateResponse toResponse(PipelineTemplate t) {
        // Sort by orderIndex defensively: @OrderBy governs DB load, but a freshly-mutated
        // in-memory aggregate (create/update within the same tx) may not be re-ordered yet.
        List<PipelineStageResponse> stages = t.getStages().stream()
                .sorted(Comparator.comparingInt(PipelineStage::getOrderIndex))
                .map(this::toStageResponse)
                .toList();
        return new PipelineTemplateResponse(t.getId(), t.getName(), t.isActive(), stages);
    }

    public PipelineStageResponse toStageResponse(PipelineStage s) {
        return new PipelineStageResponse(
                s.getId(), s.getOrderIndex(), s.getName(), s.getCategory().name(), s.isProtected());
    }

    public RequisitionResponse toResponse(JobRequisition r) {
        return new RequisitionResponse(
                r.getId(), r.getTitle(), r.getDepartmentId(), r.getPositionId(),
                r.getEmploymentType().name(), toMoneyResponse(r.getSalaryMin()),
                toMoneyResponse(r.getSalaryMax()), r.getHeadcount(), r.getStatus().name(),
                r.getRaisedByEmployeeId(), r.getTargetStartDate(), r.getDescription());
    }

    public PostingResponse toResponse(JobPosting p) {
        return new PostingResponse(
                p.getId(), p.getRequisitionId(), p.getPipelineTemplateId(), p.getTitle(),
                p.getDescription(), p.getLocation(), p.getStatus().name(),
                p.getPublishedAt(), p.getClosingDate());
    }

    public ApplicantResponse toResponse(Applicant a) {
        return new ApplicantResponse(
                a.getId(), a.getJobPostingId(), a.getFirstName(), a.getLastName(), a.getEmail(),
                a.getPhoneNumber(), a.getNationalId(), a.getKraPin(), a.getNhifNumber(),
                a.getNssfNumber(), a.getCurrentStageId(), a.getSource(), a.getAppliedAt());
    }

    public StageTransitionResponse toResponse(StageTransition t) {
        return new StageTransitionResponse(
                t.getId(), t.getApplicantId(), t.getFromStageId(), t.getToStageId(),
                t.getMovedByUserId(), t.getNote(), t.getMovedAt());
    }

    public InterviewResponse toResponse(Interview i) {
        return new InterviewResponse(
                i.getId(), i.getApplicantId(), i.getScheduledAt(), i.getInterviewerEmployeeId(),
                i.getMode() != null ? i.getMode().name() : null, i.getStatus().name(), i.getLocation());
    }

    public FeedbackResponse toResponse(InterviewFeedback f) {
        return new FeedbackResponse(
                f.getId(), f.getInterviewId(), f.getSubmittedByEmployeeId(), f.getRating(),
                f.getRecommendation() != null ? f.getRecommendation().name() : null,
                f.getComments(), f.getSubmittedAt());
    }

    private MoneyResponse toMoneyResponse(Money money) {
        return money != null ? new MoneyResponse(money.getAmount(), money.getCurrency()) : null;
    }
}
