package com.andikisha.document.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.application.mapper.DocumentMapper;
import com.andikisha.document.application.port.DocumentEventPublisher;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    // Document types that follow the DRAFT → HR-issue → deliver lifecycle (#56).
    private static final Set<DocumentType> ISSUABLE_TYPES = Set.of(DocumentType.CERTIFICATE_OF_SERVICE);

    private final DocumentRepository repository;
    private final DocumentMapper mapper;
    private final FileStorage fileStorage;
    private final DocumentEventPublisher eventPublisher;

    public DocumentService(DocumentRepository repository,
                           DocumentMapper mapper,
                           FileStorage fileStorage,
                           DocumentEventPublisher eventPublisher) {
        this.repository = repository;
        this.mapper = mapper;
        this.fileStorage = fileStorage;
        this.eventPublisher = eventPublisher;
    }

    /**
     * HR issues a reviewed DRAFT certificate (Employment Act §51). Transitions DRAFT → ISSUED and
     * publishes the ready event that drives delivery (portal + email, #54). Only a DRAFT of an
     * issuable type can be issued; re-issuing or issuing a non-draft is rejected.
     */
    @Transactional
    public DocumentResponse issue(UUID documentId, String issuedBy) {
        String tenantId = TenantContext.requireTenantId();
        Document doc = repository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));

        if (!ISSUABLE_TYPES.contains(doc.getDocumentType())) {
            throw new BusinessRuleException("NOT_ISSUABLE",
                    "This document type cannot be issued: " + doc.getDocumentType());
        }
        if (doc.getStatus() != DocumentStatus.DRAFT) {
            throw new BusinessRuleException("NOT_DRAFT",
                    "Only a DRAFT document can be issued; current status is " + doc.getStatus());
        }

        doc.markIssued();
        Document issued = repository.save(doc);
        eventPublisher.publishDocumentReady(issued);
        log.info("Certificate {} issued by {} — delivery triggered", documentId, issuedBy);
        return mapper.toResponse(issued);
    }

    public DocumentResponse getById(UUID documentId) {
        String tenantId = TenantContext.requireTenantId();
        Document doc = repository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        return mapper.toResponse(doc);
    }

    // Roles that may download any document in the tenant.
    private static final Set<String> PRIVILEGED_ROLES = Set.of("ADMIN", "HR_MANAGER", "HR_OFFICER");
    // Document types an employee may download for themselves. Deliberately NOT "any own
    // document" — HR may store sensitive docs against an employee (e.g. WARNING_LETTER).
    private static final Set<DocumentType> SELF_SERVICE_TYPES =
            Set.of(DocumentType.PAYSLIP, DocumentType.P9_FORM);

    /**
     * Single DB round-trip for download — combines metadata + file retrieval.
     *
     * <p>Privileged roles (ADMIN/HR_MANAGER/HR_OFFICER) may download any document. An
     * EMPLOYEE or LINE_MANAGER may download only their OWN document (by employeeId) and
     * only a self-service type (payslip / P9). Without this guard, opening the endpoint to
     * employees would be an IDOR — any employee could pull any document by id (B-5 D4).
     */
    public DownloadResult download(UUID documentId, String callerRole, String callerEmployeeId) {
        String tenantId = TenantContext.requireTenantId();
        Document doc = repository.findByIdAndTenantId(documentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        enforceDownloadAccess(doc, callerRole, callerEmployeeId);
        byte[] content = fileStorage.retrieve(doc.getFilePath());
        return new DownloadResult(doc.getFileName(), doc.getContentType(), content);
    }

    private void enforceDownloadAccess(Document doc, String callerRole, String callerEmployeeId) {
        if (callerRole != null && PRIVILEGED_ROLES.contains(callerRole.toUpperCase())) {
            return;
        }
        // Self-service: own document only. LINE_MANAGER is OWN-scoped here too — payslips are
        // private comp, so a manager downloads their own, not their team's.
        if (callerEmployeeId == null || callerEmployeeId.isBlank()
                || doc.getEmployeeId() == null
                || !callerEmployeeId.equals(doc.getEmployeeId().toString())) {
            throw new AccessDeniedException(
                    "Access denied: you may only download your own documents");
        }
        if (!SELF_SERVICE_TYPES.contains(doc.getDocumentType())) {
            throw new AccessDeniedException(
                    "Access denied: this document type is not available for self-service download");
        }
    }

    public Page<DocumentResponse> getForEmployee(UUID employeeId, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
                        tenantId, employeeId, pageable)
                .map(mapper::toResponse);
    }

    /**
     * Self-service discovery for the calling employee: their own documents, restricted to the
     * self-service type allowlist (payslip / P9). Lets the portal resolve a downloadable
     * documentId without exposing the admin-only tenant-wide listing endpoints. Own-scope is
     * guaranteed by employeeId coming from the gateway-supplied X-Employee-ID header, not a
     * client-chosen path variable, so there is no IDOR surface (B-5 D4 follow-on).
     */
    public List<DocumentResponse> getMySelfServiceDocuments(UUID employeeId) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndEmployeeIdAndDocumentTypeInOrderByCreatedAtDesc(
                        tenantId, employeeId, SELF_SERVICE_TYPES)
                .stream().map(mapper::toResponse).toList();
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
