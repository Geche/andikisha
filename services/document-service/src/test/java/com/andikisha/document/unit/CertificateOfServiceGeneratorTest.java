package com.andikisha.document.unit;

import com.andikisha.document.application.port.DocumentEventPublisher;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.application.port.PdfGenerator;
import com.andikisha.document.application.service.CertificateOfServiceGenerator;
import com.andikisha.document.application.service.CertificateOfServiceHtmlBuilder;
import com.andikisha.document.application.service.DocumentPersistenceHelper;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import com.andikisha.document.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.proto.employee.EmployeeResponse;
import com.google.protobuf.Timestamp;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CertificateOfServiceGeneratorTest {

    private static final String TENANT_ID = "tenant-1";
    private static final UUID EMPLOYEE_ID = UUID.randomUUID();
    private static final UUID DOC_ID = UUID.randomUUID();
    private static final LocalDate FALLBACK = LocalDate.of(2026, 6, 30);

    @Mock DocumentRepository documentRepository;
    @Mock EmployeeGrpcClient employeeClient;
    @Mock CertificateOfServiceHtmlBuilder htmlBuilder;
    @Mock PdfGenerator pdfGenerator;
    @Mock FileStorage fileStorage;
    @Mock DocumentPersistenceHelper persistenceHelper;
    @Mock DocumentEventPublisher eventPublisher;

    private CertificateOfServiceGenerator generator() {
        return new CertificateOfServiceGenerator(documentRepository, employeeClient, htmlBuilder,
                pdfGenerator, fileStorage, persistenceHelper, eventPublisher);
    }

    @Test
    void generateAsync_whenCertificateAlreadyActive_skipsWithoutFetchingOrGenerating() {
        when(documentRepository.existsByTenantIdAndEmployeeIdAndDocumentTypeAndStatusIn(
                eq(TENANT_ID), eq(EMPLOYEE_ID), eq(DocumentType.CERTIFICATE_OF_SERVICE), any(Collection.class)))
                .thenReturn(true);

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        verifyNoInteractions(employeeClient, htmlBuilder, pdfGenerator, fileStorage, eventPublisher);
        verify(persistenceHelper, never()).createGenerating(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void generateAsync_happyPath_generatesCertificateAndPublishesReady() {
        when(documentRepository.existsByTenantIdAndEmployeeIdAndDocumentTypeAndStatusIn(
                any(), any(), any(), any())).thenReturn(false);
        when(employeeClient.getEmployee(TENANT_ID, EMPLOYEE_ID.toString())).thenReturn(sampleEmployee());
        when(htmlBuilder.build(any(), any(), any(), any(), any(), any(), any(), any())).thenReturn("<html>cert</html>");
        when(pdfGenerator.generateFromHtml(anyString())).thenReturn("cert-bytes".getBytes());

        Document generating = mock(Document.class);
        when(generating.getId()).thenReturn(DOC_ID);
        Document ready = mock(Document.class);
        when(persistenceHelper.createGenerating(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(generating);
        when(persistenceHelper.markReady(eq(DOC_ID), anyLong())).thenReturn(ready);

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        // Persisted as a CERTIFICATE_OF_SERVICE with null period/payrollRunId (certificate-specific).
        verify(persistenceHelper).createGenerating(eq(TENANT_ID), eq(EMPLOYEE_ID), eq("Jane Mwangi"),
                eq(DocumentType.CERTIFICATE_OF_SERVICE), anyString(), anyString(), anyString(),
                eq("application/pdf"), isNull(), isNull(), eq("SYSTEM"));
        verify(fileStorage).store(anyString(), any(byte[].class));
        verify(persistenceHelper).markReady(eq(DOC_ID), anyLong());
        verify(eventPublisher).publishDocumentReady(ready);
        verify(persistenceHelper, never()).markFailed(any(), any());
    }

    @Test
    void generateAsync_whenStorageFails_marksFailedAndDoesNotPublish() {
        when(documentRepository.existsByTenantIdAndEmployeeIdAndDocumentTypeAndStatusIn(
                any(), any(), any(), any())).thenReturn(false);
        when(employeeClient.getEmployee(TENANT_ID, EMPLOYEE_ID.toString())).thenReturn(sampleEmployee());
        when(htmlBuilder.build(any(), any(), any(), any(), any(), any(), any(), any())).thenReturn("<html>cert</html>");
        when(pdfGenerator.generateFromHtml(anyString())).thenReturn("cert-bytes".getBytes());

        Document generating = mock(Document.class);
        when(generating.getId()).thenReturn(DOC_ID);
        when(persistenceHelper.createGenerating(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(generating);
        doThrow(new RuntimeException("disk full")).when(fileStorage).store(anyString(), any(byte[].class));

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        verify(persistenceHelper).markFailed(eq(DOC_ID), anyString());
        verify(eventPublisher, never()).publishDocumentReady(any());
    }

    private EmployeeResponse sampleEmployee() {
        long hireSeconds = LocalDate.of(2020, 1, 15).atStartOfDay(java.time.ZoneOffset.UTC).toEpochSecond();
        return EmployeeResponse.newBuilder()
                .setEmployeeNumber("EMP-001")
                .setFirstName("Jane")
                .setLastName("Mwangi")
                .setPositionTitle("Software Engineer")
                .setDepartmentName("Engineering")
                .setHireDate(Timestamp.newBuilder().setSeconds(hireSeconds).build())
                .build();
    }
}
