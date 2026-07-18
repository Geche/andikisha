package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.PipelineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PipelineTemplateRepository extends JpaRepository<PipelineTemplate, UUID> {

    Optional<PipelineTemplate> findByIdAndTenantId(UUID id, String tenantId);

    List<PipelineTemplate> findByTenantIdOrderByNameAsc(String tenantId);

    boolean existsByTenantId(String tenantId);
}
