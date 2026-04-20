package com.andikisha.document.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.application.mapper.DocumentMapper;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository repository;
    private final DocumentMapper mapper;
    private final FileStorage fileStorage;

    public DocumentService(DocumentRepository repository,
                           DocumentMapper mapper,
                           FileStorage fileStorage) {
        this.repository = repository;
        this.mapper = mapper;
        this.fileStorage = fileStorage;
    }

    public DocumentResponse getById(UUID documentId) {
        String tenantId = TenantContext.requireTenantId();
        Document doc = repository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        return mapper.toResponse(doc);
    }

    /**
     * Single DB round-trip for download — combines metadata + file retrieval.
     */
    public DownloadResult download(UUID documentId) {
        String tenantId = TenantContext.requireTenantId();
        Document doc = repository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        byte[] content = fileStorage.retrieve(doc.getFilePath());
        return new DownloadResult(doc.getFileName(), doc.getContentType(), content);
    }

    public Page<DocumentResponse> getForEmployee(UUID employeeId, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
                        tenantId, employeeId, pageable)
                .map(mapper::toResponse);
    }

    public Page<DocumentResponse> getByType(String type, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        DocumentType docType;
        try {
            docType = DocumentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_DOCUMENT_TYPE",
                    "Unknown document type: " + type
                    + ". Valid types: " + List.of(DocumentType.values()));
        }
        return repository.findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(
                        tenantId, docType, pageable)
                .map(mapper::toResponse);
    }

    public List<DocumentResponse> getForPayrollRun(UUID payrollRunId) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndPayrollRunId(tenantId, payrollRunId)
                .stream().map(mapper::toResponse).toList();
    }

    public Page<DocumentResponse> listAll(Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(mapper::toResponse);
    }

    public record DownloadResult(String fileName, String contentType, byte[] content) {}
}
