package com.andikisha.integration.domain.repository;

import com.andikisha.integration.domain.model.FilingRecord;
import com.andikisha.integration.domain.model.IntegrationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FilingRecordRepository extends JpaRepository<FilingRecord, UUID> {

    Optional<FilingRecord> findByIdAndTenantId(UUID id, String tenantId);

    Optional<FilingRecord> findByTenantIdAndFilingTypeAndPeriod(
            String tenantId, IntegrationType type, String period);

    Page<FilingRecord> findByTenantIdOrderByCreatedAtDesc(
            String tenantId, Pageable pageable);

    Page<FilingRecord> findByTenantIdAndFilingTypeOrderByPeriodDesc(
            String tenantId, IntegrationType type, Pageable pageable);
}