package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.TenantSignatory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantSignatoryRepository extends JpaRepository<TenantSignatory, String> {

    Optional<TenantSignatory> findByTenantId(String tenantId);
}
