package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, UUID> {

    List<InterviewFeedback> findByTenantIdAndInterviewIdOrderBySubmittedAtAsc(String tenantId, UUID interviewId);
}
