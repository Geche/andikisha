package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.JobRequisition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobRequisitionRepository extends JpaRepository<JobRequisition, UUID> {

    Optional<JobRequisition> findByIdAndTenantId(UUID id, String tenantId);

    List<JobRequisition> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
