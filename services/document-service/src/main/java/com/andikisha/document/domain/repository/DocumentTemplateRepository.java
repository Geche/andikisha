package com.andikisha.document.domain.repository;

import com.andikisha.document.domain.model.DocumentTemplate;
import com.andikisha.document.domain.model.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, UUID> {

    Optional<DocumentTemplate> findByTenantIdAndDocumentTypeAndActiveTrue(
            String tenantId, DocumentType type);

    List<DocumentTemplate> findByTenantIdAndActiveTrue(String tenantId);
}
