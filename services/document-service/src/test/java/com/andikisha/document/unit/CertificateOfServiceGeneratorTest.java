package com.andikisha.document.unit;

import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.application.port.PdfGenerator;
import com.andikisha.document.application.service.CertificateOfServiceGenerator;
import com.andikisha.document.application.service.CertificateOfServiceHtmlBuilder;
import com.andikisha.document.application.service.DocumentPersistenceHelper;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import com.andikisha.document.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.document.infrastructure.grpc.TenantGrpcClient;
import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.tenant.TenantResponse;
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
    private static final String EMPLOYER_PLACEHOLDER = "[Employer name pending tenant profile]";

    @Mock DocumentRepository documentRepository;
    @Mock EmployeeGrpcClient employeeClient;
    @Mock TenantGrpcClient tenantClient;
    @Mock CertificateOfServiceHtmlBuilder htmlBuilder;
    @Mock PdfGenerator pdfGenerator;
    @Mock FileStorage fileStorage;
    @Mock DocumentPersistenceHelper persistenceHelper;

    private CertificateOfServiceGenerator generator() {
        return new CertificateOfServiceGenerator(documentRepository, employeeClient, tenantClient,
                htmlBuilder, pdfGenerator, fileStorage, persistenceHelper);
    }

    @Test
    void generateAsync_whenCertificateAlreadyActive_skipsWithoutFetchingOrGenerating() {
        when(documentRepository.existsByTenantIdAndEmployeeIdAndDocumentTypeAndStatusIn(
                eq(TENANT_ID), eq(EMPLOYEE_ID), eq(DocumentType.CERTIFICATE_OF_SERVICE), any(Collection.class)))
                .thenReturn(true);

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        verifyNoInteractions(employeeClient, tenantClient, htmlBuilder, pdfGenerator, fileStorage);
        verify(persistenceHelper, never()).createGenerating(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void generateAsync_happyPath_usesResolvedEmployerNameAndMarksDraft() {
        stubForGeneration();
        when(tenantClient.getTenant(TENANT_ID))
                .thenReturn(TenantResponse.newBuilder().setName("Acme Ltd").build());

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        // §51(2): the resolved employer name (not the placeholder) is the first arg to the builder.
        verify(htmlBuilder).build(eq("Acme Ltd"), eq("Jane Mwangi"), eq("EMP-001"),
                any(), any(), any(), any(), any());
        // #56: certificate is DRAFTED (awaiting HR issue), never auto-marked READY/delivered.
        verify(persistenceHelper).markDraft(eq(DOC_ID), anyLong());
        verify(persistenceHelper, never()).markReady(any(), anyLong());
        verify(persistenceHelper, never()).markFailed(any(), any());
    }

    @Test
    void generateAsync_whenTenantLookupFails_fallsBackToPlaceholderAndStillDrafts() {
        stubForGeneration();
        when(tenantClient.getTenant(TENANT_ID)).thenThrow(new RuntimeException("tenant-service down"));

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        verify(htmlBuilder).build(eq(EMPLOYER_PLACEHOLDER), anyString(), anyString(),
                any(), any(), any(), any(), any());
        verify(persistenceHelper).markDraft(eq(DOC_ID), anyLong());
        verify(persistenceHelper, never()).markFailed(any(), any());
    }

    @Test
    void generateAsync_whenStorageFails_marksFailedAndDoesNotDraft() {
        stubForGeneration();
        when(tenantClient.getTenant(TENANT_ID))
                .thenReturn(TenantResponse.newBuilder().setName("Acme Ltd").build());
        doThrow(new RuntimeException("disk full")).when(fileStorage).store(anyString(), any(byte[].class));

        generator().generateAsync(TENANT_ID, EMPLOYEE_ID.toString(), FALLBACK);

        verify(persistenceHelper).markFailed(eq(DOC_ID), anyString());
        verify(persistenceHelper, never()).markDraft(any(), anyLong());
    }

    /** Common stubs for the path where a certificate is actually generated. */
    private void stubForGeneration() {
        when(documentRepository.existsByTenantIdAndEmployeeIdAndDocumentTypeAndStatusIn(
                any(), any(), any(), any())).thenReturn(false);
        when(employeeClient.getEmployee(TENANT_ID, EMPLOYEE_ID.toString())).thenReturn(sampleEmployee());
        when(htmlBuilder.build(any(), any(), any(), any(), any(), any(), any(), any())).thenReturn("<html>cert</html>");
        when(pdfGenerator.generateFromHtml(anyString())).thenReturn("cert-bytes".getBytes());
        Document generating = mock(Document.class);
        when(generating.getId()).thenReturn(DOC_ID);
        when(persistenceHelper.createGenerating(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(generating);
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
