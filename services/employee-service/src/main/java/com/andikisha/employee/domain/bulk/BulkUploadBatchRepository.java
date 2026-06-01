package com.andikisha.employee.domain.bulk;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BulkUploadBatchRepository extends JpaRepository<BulkUploadBatch, UUID> {

    Optional<BulkUploadBatch> findByIdAndTenantId(UUID id, String tenantId);
}
