package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicantRepository extends JpaRepository<Applicant, UUID> {

    Optional<Applicant> findByIdAndTenantId(UUID id, String tenantId);

    List<Applicant> findByTenantIdAndJobPostingIdOrderByAppliedAtAsc(String tenantId, UUID jobPostingId);

    /** Guard: a stage that currently holds applicants cannot be deleted (STAGE_HAS_APPLICANTS). */
    boolean existsByTenantIdAndCurrentStageId(String tenantId, UUID currentStageId);
}
