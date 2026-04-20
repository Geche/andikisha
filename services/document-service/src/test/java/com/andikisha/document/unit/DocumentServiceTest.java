package com.andikisha.document.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.application.mapper.DocumentMapper;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.application.service.DocumentService;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
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

    private DocumentService service;

    @BeforeEach
    void setUp() {
        service = new DocumentService(repository, mapper, fileStorage);
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

        DocumentService.DownloadResult result = service.download(DOC_ID);

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

        assertThatThrownBy(() -> service.download(DOC_ID))
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
