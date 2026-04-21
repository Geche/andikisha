package com.andikisha.integration.domain.repository;

import com.andikisha.integration.domain.model.IntegrationConfig;
import com.andikisha.integration.domain.model.IntegrationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, UUID> {

    Optional<IntegrationConfig> findByTenantIdAndIntegrationType(
            String tenantId, IntegrationType type);

    List<IntegrationConfig> findByTenantId(String tenantId);

    Optional<IntegrationConfig> findByTenantIdAndIntegrationTypeAndActiveTrue(
            String tenantId, IntegrationType type);
}