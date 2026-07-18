package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    Optional<Interview> findByIdAndTenantId(UUID id, String tenantId);

    List<Interview> findByTenantIdOrderByScheduledAtDesc(String tenantId);

    List<Interview> findByTenantIdAndInterviewerEmployeeIdOrderByScheduledAtDesc(
            String tenantId, UUID interviewerEmployeeId);

    List<Interview> findByTenantIdAndApplicantIdOrderByScheduledAtDesc(String tenantId, UUID applicantId);
}
