package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * Feedback submitted by the assigned interviewer for an interview. {@code submittedByEmployeeId}
 * is the interviewer (Form B ownership: must equal the interview's interviewerEmployeeId).
 */
@Getter
@Entity
@Table(name = "interview_feedback")
public class InterviewFeedback extends BaseEntity {

    @Column(name = "interview_id", nullable = false)
    private UUID interviewId;

    @Column(name = "submitted_by_employee_id", nullable = false)
    private UUID submittedByEmployeeId;

    @Column
    private Integer rating;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FeedbackRecommendation recommendation;

    @Column(columnDefinition = "text")
    private String comments;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    protected InterviewFeedback() {}

    public static InterviewFeedback create(String tenantId, UUID interviewId,
                                           UUID submittedByEmployeeId, Integer rating,
                                           FeedbackRecommendation recommendation, String comments) {
        InterviewFeedback f = new InterviewFeedback();
        f.setTenantId(tenantId);
        f.interviewId = interviewId;
        f.submittedByEmployeeId = submittedByEmployeeId;
        f.rating = rating;
        f.recommendation = recommendation;
        f.comments = comments;
        f.submittedAt = Instant.now();
        return f;
    }
}
