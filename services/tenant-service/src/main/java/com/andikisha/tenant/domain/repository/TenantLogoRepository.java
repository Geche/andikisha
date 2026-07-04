package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.TenantLogo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantLogoRepository extends JpaRepository<TenantLogo, String> {

    Optional<TenantLogo> findByTenantId(String tenantId);
}
