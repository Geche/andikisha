package com.andikisha.document.application.service;

import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Short-lived transactional operations for document status transitions.
 *
 * <p>Each method uses REQUIRES_NEW so it commits in its OWN transaction, independent of the caller.
 * The async generators orchestrate I/O (PDF render, gRPC) outside any transaction; without
 * REQUIRES_NEW these writes would join the caller's context and, when that context is read-only,
 * be silently discarded (the generators were @Transactional(readOnly=true), so nothing persisted).
 */
@Service
public class DocumentPersistenceHelper {

    private final DocumentRepository repository;

    public DocumentPersistenceHelper(DocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Document createGenerating(String tenantId, UUID employeeId, String employeeName,
                                     DocumentType type, String title,
                                     String fileName, String filePath, String contentType,
                                     String period, UUID payrollRunId, String generatedBy) {
        Document doc = Document.create(tenantId, employeeId, employeeName,
                type, title, fileName, filePath, contentType);
        doc.setPeriod(period);
        doc.setPayrollRunId(payrollRunId);
        doc.setGeneratedBy(generatedBy);
        return repository.save(doc);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Document markReady(UUID documentId, long fileSize) {
        Document doc = repository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        doc.markReady(fileSize);
        return repository.save(doc);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Document markDraft(UUID documentId, long fileSize) {
        Document doc = repository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        doc.markDraft(fileSize);
        return repository.save(doc);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(UUID documentId, String error) {
        repository.findById(documentId).ifPresent(doc -> {
            doc.markFailed(error);
            repository.save(doc);
        });
    }
}
