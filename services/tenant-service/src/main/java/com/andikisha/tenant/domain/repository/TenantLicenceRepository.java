package com.andikisha.tenant.domain.repository;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.tenant.domain.model.TenantLicence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantLicenceRepository extends JpaRepository<TenantLicence, UUID> {

    Optional<TenantLicence> findByTenantIdAndStatusIn(String tenantId, List<LicenceStatus> statuses);

    List<TenantLicence> findByStatusIn(List<LicenceStatus> statuses);

    List<TenantLicence> findByStatusAndEndDateBefore(LicenceStatus status, LocalDate date);

    List<TenantLicence> findByStatusAndSuspendedAtBefore(LicenceStatus status, LocalDateTime dateTime);

    List<TenantLicence> findByStatusInAndEndDateBetween(List<LicenceStatus> statuses,
                                                        LocalDate from,
                                                        LocalDate to);

    Optional<TenantLicence> findByLicenceKey(UUID licenceKey);
}
