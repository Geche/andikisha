package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.PlanTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<Plan, UUID> {

    Optional<Plan> findByNameAndTenantId(String name, String tenantId);

    Optional<Plan> findByTierAndTenantId(PlanTier tier, String tenantId);

    List<Plan> findByTenantIdAndActiveTrue(String tenantId);
}