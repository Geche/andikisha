package com.andikisha.tenant.domain.repository;

import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findByIdAndTenantId(UUID id, String tenantId);

    Optional<Tenant> findByAdminEmail(String adminEmail);

    boolean existsByAdminEmail(String adminEmail);

    boolean existsByCompanyNameAndCountry(String companyName, String country);

    Page<Tenant> findByStatus(TenantStatus status, Pageable pageable);

    List<Tenant> findByStatusAndTrialEndsAtBefore(TenantStatus status, LocalDate date);
}