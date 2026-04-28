package com.andikisha.tenant.domain.repository;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.tenant.domain.model.LicenceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LicenceHistoryRepository extends JpaRepository<LicenceHistory, UUID> {

    List<LicenceHistory> findByLicenceIdOrderByChangedAtDesc(UUID licenceId);

    List<LicenceHistory> findByTenantIdOrderByChangedAtDesc(String tenantId);

    Optional<LicenceHistory> findFirstByLicenceIdAndNewStatusOrderByChangedAtAsc(UUID licenceId,
                                                                                 LicenceStatus newStatus);
}
