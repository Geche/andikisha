package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.LifecycleType;
import com.andikisha.employee.domain.model.LifecycleWorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LifecycleWorkflowTemplateRepository
        extends JpaRepository<LifecycleWorkflowTemplate, UUID> {

    Optional<LifecycleWorkflowTemplate> findByIdAndTenantId(UUID id, String tenantId);

    List<LifecycleWorkflowTemplate> findByTenantIdOrderByTypeAsc(String tenantId);

    boolean existsByTenantIdAndType(String tenantId, LifecycleType type);

    Optional<LifecycleWorkflowTemplate> findFirstByTenantIdAndTypeAndActiveTrueOrderByCreatedAtAsc(
            String tenantId, LifecycleType type);
}
