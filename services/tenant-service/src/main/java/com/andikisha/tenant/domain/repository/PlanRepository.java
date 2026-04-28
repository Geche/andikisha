package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.PlanTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;

public interface PlanRepository extends JpaRepository<Plan, UUID> {

    Optional<Plan> findByNameAndTenantId(String name, String tenantId);

    Optional<Plan> findByTierAndTenantId(PlanTier tier, String tenantId);

    List<Plan> findByTenantIdAndActiveTrue(String tenantId);

    /** System-global plan lookup — used by superadmin and licence flows. */
    @Query("SELECT p FROM Plan p WHERE p.name = :name AND p.tenantId = 'SYSTEM'")
    Optional<Plan> findByName(String name);

    /** System-global active plans — used by analytics and seeding. */
    @Query("SELECT p FROM Plan p WHERE p.active = true AND p.tenantId = 'SYSTEM'")
    List<Plan> findByActiveTrue();
}