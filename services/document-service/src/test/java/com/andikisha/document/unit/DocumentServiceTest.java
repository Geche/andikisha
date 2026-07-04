package com.andikisha.document.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.application.mapper.DocumentMapper;
import com.andikisha.document.application.port.DocumentEventPublisher;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.application.service.DocumentService;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import org.springframework.security.access.AccessDeniedException;
import com.andikisha.document.domain.repository.DocumentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    private static final String TENANT_ID   = "test-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final UUID   DOC_ID      = UUID.randomUUID();

    @Mock DocumentRepository repository;
    @Mock DocumentMapper mapper;
    @Mock FileStorage fileStorage;
    @Mock DocumentEventPublisher eventPublisher;

    private DocumentService service;

    @BeforeEach
    void setUp() {
        service = new DocumentService(repository, mapper, fileStorage, eventPublisher);
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // getById
    // -------------------------------------------------------------------------

    @Test
    void getById_happyPath_returnsResponse() {
        Document doc = stubDocument();
        DocumentResponse response = stubResponse(doc);
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(doc));
        when(mapper.toResponse(doc)).thenReturn(response);

        DocumentResponse result = service.getById(DOC_ID);

        assertThat(result.id()).isEqualTo(DOC_ID);
        verify(repository).findByIdAndTenantId(DOC_ID, TENANT_ID);
    }

    @Test
    void getById_whenNotFound_throwsResourceNotFoundException() {
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(DOC_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(fileStorage);
    }

    @Test
    void getById_enforcesTenantIsolation_callsRepoWithCurrentTenantOnly() {
        // Repository is called with the current tenant — cross-tenant isolation is the repo's contract
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(DOC_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, times(1)).findByIdAndTenantId(DOC_ID, TENANT_ID);
    }

    // -------------------------------------------------------------------------
    // download — single DB round-trip (I5 regression guard)
    // -------------------------------------------------------------------------

    @Test
    void download_singleDbLookup_returnsFileBytes() {
        Document doc = stubDocument();
        byte[] expected = "PDF-CONTENT".getBytes();
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(doc));
        when(fileStorage.retrieve(doc.getFilePath())).thenReturn(expected);

        DocumentService.DownloadResult result = service.download(DOC_ID, "HR_MANAGER", null);

        assertThat(result.content()).isEqualTo(expected);
        assertThat(result.fileName()).isEqualTo(doc.getFileName());
        assertThat(result.contentType()).isEqualTo(doc.getContentType());
        // Exactly one DB lookup — not two (I5: no separate getById + downloadFile)
        verify(repository, times(1)).findByIdAndTenantId(DOC_ID, TENANT_ID);
        verify(fileStorage).retrieve(doc.getFilePath());
    }

    @Test
    void download_whenDocumentNotFound_throwsResourceNotFoundException() {
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.download(DOC_ID, "HR_MANAGER", null))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(fileStorage);
    }

    // -------------------------------------------------------------------------
    // getByType — invalid type → BusinessRuleException (I3 regression guard)
    // -------------------------------------------------------------------------

    @Test
    void getByType_invalidType_throwsBusinessRuleException() {
        assertThatThrownBy(() -> service.getByType("INVALID_TYPE", PageRequest.of(0, 10)))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode())
                        .isEqualTo("INVALID_DOCUMENT_TYPE"));

        verifyNoInteractions(repository);
    }

    @Test
    void getByType_validType_delegatesToRepository() {
        var pageable = PageRequest.of(0, 10);
        when(repository.findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(
                TENANT_ID, DocumentType.PAYSLIP, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        service.getByType("PAYSLIP", pageable);

        verify(repository).findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(
                TENANT_ID, DocumentType.PAYSLIP, pageable);
    }

    @Test
    void getByType_caseInsensitive_resolvesTYPE() {
        var pageable = PageRequest.of(0, 10);
        when(repository.findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        service.getByType("payslip", pageable);

        verify(repository).findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(
                TENANT_ID, DocumentType.PAYSLIP, pageable);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // download ownership (B-5 D4) — EMPLOYEE/LINE_MANAGER own-scope + type allowlist
    // -------------------------------------------------------------------------

    @Test
    void download_asEmployeeOwnPayslip_returnsFileBytes() {
        Document doc = stubDocument(); // PAYSLIP owned by EMPLOYEE_ID
        byte[] expected = "PDF".getBytes();
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(doc));
        when(fileStorage.retrieve(doc.getFilePath())).thenReturn(expected);

        DocumentService.DownloadResult result =
                service.download(DOC_ID, "EMPLOYEE", EMPLOYEE_ID.toString());

        assertThat(result.content()).isEqualTo(expected);
    }

    @Test
    void download_asEmployeeOtherEmployeesDocument_throwsAccessDenied() {
        Document doc = stubDocument(); // owned by EMPLOYEE_ID
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(doc));

        assertThatThrownBy(() ->
                service.download(DOC_ID, "EMPLOYEE", UUID.randomUUID().toString()))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(fileStorage);
    }

    @Test
    void download_asEmployeeOwnNonSelfServiceType_throwsAccessDenied() {
        Document warning = Document.create(TENANT_ID, EMPLOYEE_ID, "Jane Mwangi",
                DocumentType.WARNING_LETTER, "Warning", "warn.pdf",
                TENANT_ID + "/warn.pdf", "application/pdf");
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(warning));

        // Owns the document, but a warning letter is not a self-service type.
        assertThatThrownBy(() ->
                service.download(DOC_ID, "EMPLOYEE", EMPLOYEE_ID.toString()))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(fileStorage);
    }

    // -------------------------------------------------------------------------
    // getMySelfServiceDocuments (B-5 D4 follow-on) — own docs, self-service types only
    // -------------------------------------------------------------------------

    @Test
    void getMySelfServiceDocuments_queriesOwnDocsRestrictedToSelfServiceTypes() {
        Document doc = stubDocument();
        DocumentResponse response = stubResponse(doc);
        when(repository.findByTenantIdAndEmployeeIdAndDocumentTypeInOrderByCreatedAtDesc(
                eq(TENANT_ID), eq(EMPLOYEE_ID), any()))
                .thenReturn(List.of(doc));
        when(mapper.toResponse(doc)).thenReturn(response);

        List<DocumentResponse> result = service.getMySelfServiceDocuments(EMPLOYEE_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(DOC_ID);
        // The type filter must be exactly the self-service allowlist (PAYSLIP, P9_FORM) —
        // never any-own-document, which would leak e.g. a WARNING_LETTER.
        var typesCaptor = org.mockito.ArgumentCaptor.forClass(java.util.Collection.class);
        verify(repository).findByTenantIdAndEmployeeIdAndDocumentTypeInOrderByCreatedAtDesc(
                eq(TENANT_ID), eq(EMPLOYEE_ID), typesCaptor.capture());
        assertThat(typesCaptor.getValue())
                .containsExactlyInAnyOrder(DocumentType.PAYSLIP, DocumentType.P9_FORM);
    }

    @Test
    void getMySelfServiceDocuments_whenNoneExist_returnsEmptyList() {
        when(repository.findByTenantIdAndEmployeeIdAndDocumentTypeInOrderByCreatedAtDesc(
                eq(TENANT_ID), eq(EMPLOYEE_ID), any()))
                .thenReturn(List.of());

        assertThat(service.getMySelfServiceDocuments(EMPLOYEE_ID)).isEmpty();
        verifyNoInteractions(fileStorage);
    }

    // -------------------------------------------------------------------------
    // issue — DRAFT → ISSUED + publish (#56)
    // -------------------------------------------------------------------------

    @Test
    void issue_draftCertificate_transitionsToIssuedAndPublishes() {
        Document draft = draftCertificate();
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(draft));
        when(repository.save(draft)).thenReturn(draft);

        service.issue(DOC_ID, "hr-user");

        assertThat(draft.getStatus()).isEqualTo(DocumentStatus.ISSUED);
        verify(repository).save(draft);
        verify(eventPublisher).publishDocumentReady(draft);
    }

    @Test
    void issue_nonDraft_throwsBusinessRuleAndDoesNotPublish() {
        Document already = draftCertificate();
        already.markIssued(); // already ISSUED
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(already));

        assertThatThrownBy(() -> service.issue(DOC_ID, "hr-user"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("NOT_DRAFT"));
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void issue_nonIssuableType_throwsBusinessRuleAndDoesNotPublish() {
        Document payslip = Document.create(TENANT_ID, EMPLOYEE_ID, "Jane Mwangi",
                DocumentType.PAYSLIP, "Payslip", "p.pdf", TENANT_ID + "/p.pdf", "application/pdf");
        payslip.markDraft(10);
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.of(payslip));

        assertThatThrownBy(() -> service.issue(DOC_ID, "hr-user"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("NOT_ISSUABLE"));
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void issue_documentNotFound_throwsResourceNotFound() {
        when(repository.findByIdAndTenantId(DOC_ID, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.issue(DOC_ID, "hr-user"))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(eventPublisher);
    }

    private Document draftCertificate() {
        Document doc = Document.create(TENANT_ID, EMPLOYEE_ID, "Jane Mwangi",
                DocumentType.CERTIFICATE_OF_SERVICE, "Certificate of Service - Jane Mwangi",
                "certificate_of_service_JM.pdf",
                TENANT_ID + "/certificates/certificate_of_service_JM.pdf", "application/pdf");
        doc.markDraft(1024);
        return doc;
    }

    private Document stubDocument() {
        Document doc = Document.create(TENANT_ID, EMPLOYEE_ID, "Jane Mwangi",
                DocumentType.PAYSLIP, "Payslip Apr-2024",
                "payslip_JM001_2024-04.pdf",
                TENANT_ID + "/payslips/2024-04/payslip_JM001_2024-04.pdf",
                "application/pdf");
        doc.setPeriod("2024-04");
        doc.setPayrollRunId(UUID.randomUUID());
        doc.setGeneratedBy("SYSTEM");
        return doc;
    }

    private DocumentResponse stubResponse(Document doc) {
        return new DocumentResponse(
                DOC_ID, EMPLOYEE_ID, "Jane Mwangi",
                "PAYSLIP", "Payslip Apr-2024",
                doc.getFileName(), 4096L,
                "application/pdf", DocumentStatus.READY.name(),
                "2024-04", null, "SYSTEM",
                LocalDateTime.now(), LocalDateTime.now());
    }
}
