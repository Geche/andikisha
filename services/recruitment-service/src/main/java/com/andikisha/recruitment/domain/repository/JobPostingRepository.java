package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

    Optional<JobPosting> findByIdAndTenantId(UUID id, String tenantId);

    List<JobPosting> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    /** Guard: a template referenced by any posting cannot be deactivated (TEMPLATE_IN_USE). */
    boolean existsByTenantIdAndPipelineTemplateId(String tenantId, UUID pipelineTemplateId);
}
