package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, UUID> {

    List<FeatureFlag> findByTenantId(String tenantId);

    Optional<FeatureFlag> findByTenantIdAndFeatureKey(String tenantId, String featureKey);

    boolean existsByTenantIdAndFeatureKeyAndEnabledTrue(String tenantId, String featureKey);
}