package com.andikisha.document.domain.repository;

import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    Optional<Document> findByIdAndTenantId(UUID id, String tenantId);

    Page<Document> findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
            String tenantId, UUID employeeId, Pageable pageable);

    // Self-service discovery: an employee's own documents restricted to a type allowlist
    // (payslip / P9). Bounded result set (a handful per employee) so no pagination needed.
    List<Document> findByTenantIdAndEmployeeIdAndDocumentTypeInOrderByCreatedAtDesc(
            String tenantId, UUID employeeId, Collection<DocumentType> types);

    Page<Document> findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(
            String tenantId, DocumentType type, Pageable pageable);

    List<Document> findByTenantIdAndPayrollRunId(String tenantId, UUID payrollRunId);

    Page<Document> findByTenantIdOrderByCreatedAtDesc(
            String tenantId, Pageable pageable);

    Optional<Document> findByTenantIdAndEmployeeIdAndDocumentTypeAndPeriod(
            String tenantId, UUID employeeId, DocumentType type, String period);
}