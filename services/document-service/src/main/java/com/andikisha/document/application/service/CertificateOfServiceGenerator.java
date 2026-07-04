package com.andikisha.document.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.application.port.PdfGenerator;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import com.andikisha.document.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.document.infrastructure.grpc.TenantGrpcClient;
import com.andikisha.proto.employee.EmployeeResponse;
import com.google.protobuf.Timestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.UUID;

@Service
public class CertificateOfServiceGenerator {

    private static final Logger log = LoggerFactory.getLogger(CertificateOfServiceGenerator.class);

    // Idempotency: skip if a certificate already exists in ANY non-FAILED state (GENERATING,
    // DRAFT, ISSUED, …) — a termination event can be redelivered (RabbitMQ is at-least-once).
    // Only a previously FAILED attempt is allowed to retry. Must cover the DRAFT/ISSUED lifecycle
    // (#56) — the old {GENERATING, READY} set let redelivery create duplicate drafts.
    private static final EnumSet<DocumentStatus> ACTIVE_STATUSES =
            EnumSet.complementOf(EnumSet.of(DocumentStatus.FAILED));

    // Fallback only — used when tenant-service can't be reached or has no name on file. The
    // employer name is normally resolved via TenantGrpcClient (Employment Act §52(1)).
    private static final String EMPLOYER_PLACEHOLDER = "[Employer name pending tenant profile]";

    private final DocumentRepository documentRepository;
    private final EmployeeGrpcClient employeeClient;
    private final TenantGrpcClient tenantClient;
    private final CertificateOfServiceHtmlBuilder htmlBuilder;
    private final PdfGenerator pdfGenerator;
    private final FileStorage fileStorage;
    private final DocumentPersistenceHelper persistenceHelper;

    public CertificateOfServiceGenerator(DocumentRepository documentRepository,
                                         EmployeeGrpcClient employeeClient,
                                         TenantGrpcClient tenantClient,
                                         CertificateOfServiceHtmlBuilder htmlBuilder,
                                         PdfGenerator pdfGenerator,
                                         FileStorage fileStorage,
                                         DocumentPersistenceHelper persistenceHelper) {
        this.documentRepository = documentRepository;
        this.employeeClient = employeeClient;
        this.tenantClient = tenantClient;
        this.htmlBuilder = htmlBuilder;
        this.pdfGenerator = pdfGenerator;
        this.fileStorage = fileStorage;
        this.persistenceHelper = persistenceHelper;
    }

    /**
     * Generates a Certificate of Service asynchronously in response to an employee termination.
     * Mirrors {@link PayslipGenerator}'s three-transaction boundary so I/O never holds a DB
     * connection. TenantContext is set explicitly because @Async runs off the caller's thread.
     *
     * @param terminationDateFallback used only when employee-service does not carry a persisted
     *                                termination date (the event's own timestamp).
     */
    @Async("documentTaskExecutor")
    public void generateAsync(String tenantId, String employeeId, LocalDate terminationDateFallback) {

        TenantContext.setTenantId(tenantId);
        try {
            UUID employeeUuid = UUID.fromString(employeeId);

            // Idempotency: a termination event can be redelivered. Skip if a certificate is already
            // generating or ready for this employee; allow retry only after a prior FAILED attempt.
            if (documentRepository.existsByTenantIdAndEmployeeIdAndDocumentTypeAndStatusIn(
                    tenantId, employeeUuid, DocumentType.CERTIFICATE_OF_SERVICE, ACTIVE_STATUSES)) {
                log.info("Certificate of service already present for employee {} — skipping", employeeId);
                return;
            }

            EmployeeResponse emp = employeeClient.getEmployee(tenantId, employeeId);
            String employeeName = (emp.getFirstName() + " " + emp.getLastName()).trim();
            LocalDate hireDate = toLocalDate(emp.hasHireDate() ? emp.getHireDate() : null);
            LocalDate terminationDate = emp.hasTerminationDate()
                    ? toLocalDate(emp.getTerminationDate())
                    : terminationDateFallback;
            LocalDate issueDate = terminationDateFallback; // event time — deterministic, avoids LocalDate.now()

            String fileName = String.format("certificate_of_service_%s_%s.pdf",
                    emp.getEmployeeNumber(), UUID.randomUUID());
            String filePath = String.format("%s/certificates/%s", tenantId, fileName);
            String title = "Certificate of Service - " + employeeName;

            // Transaction 1: persist GENERATING record and commit.
            Document doc = persistenceHelper.createGenerating(
                    tenantId, employeeUuid, employeeName,
                    DocumentType.CERTIFICATE_OF_SERVICE, title, fileName, filePath, "application/pdf",
                    null, null, "SYSTEM");

            try {
                // I/O outside any transaction — DB connection is free.
                String employerName = resolveEmployerName(tenantId);
                String logoDataUri = resolveLogoDataUri(tenantId);
                String html = htmlBuilder.build(
                        logoDataUri, employerName, employeeName, emp.getEmployeeNumber(),
                        emp.getPositionTitle(), emp.getDepartmentName(),
                        hireDate, terminationDate, issueDate);
                byte[] pdfBytes = pdfGenerator.generateFromHtml(html);
                fileStorage.store(filePath, pdfBytes);

                // Transaction 2: mark DRAFT and commit. A Certificate of Service is NOT delivered on
                // generation — it awaits HR review/branding/signature and issuance (#56). Delivery
                // (portal + email) is triggered by the Issue action (DocumentService.issue), not here.
                persistenceHelper.markDraft(doc.getId(), pdfBytes.length);

                log.info("Certificate of service DRAFTED for {} ({} bytes) — awaiting HR issue",
                        employeeName, pdfBytes.length);

            } catch (Exception e) {
                // Transaction 3: mark FAILED and commit.
                persistenceHelper.markFailed(doc.getId(), e.getMessage());
                log.error("Failed to generate certificate of service for {}: {}",
                        employeeName, e.getMessage());
            }

        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Resolves the registered employer name from tenant-service (§52(1)). A failed lookup or a
     * blank name must not fail certificate generation — degrade to the placeholder and log.
     */
    private String resolveEmployerName(String tenantId) {
        try {
            String name = tenantClient.getTenant(tenantId).getName();
            if (name != null && !name.isBlank()) {
                return name;
            }
            log.warn("Tenant {} has no registered name — using placeholder on certificate", tenantId);
        } catch (Exception e) {
            log.warn("Could not resolve employer name for tenant {}: {}", tenantId, e.getMessage());
        }
        return EMPLOYER_PLACEHOLDER;
    }

    /**
     * Resolves the tenant's company logo as a data URI for the certificate letterhead (#57). A
     * missing logo or a failed lookup yields null — the certificate falls back to a name-only header.
     */
    private String resolveLogoDataUri(String tenantId) {
        try {
            var logo = tenantClient.getTenantLogo(tenantId);
            if (logo.getHasLogo() && !logo.getData().isEmpty()) {
                String base64 = java.util.Base64.getEncoder().encodeToString(logo.getData().toByteArray());
                return "data:" + logo.getContentType() + ";base64," + base64;
            }
        } catch (Exception e) {
            log.warn("Could not resolve logo for tenant {}: {}", tenantId, e.getMessage());
        }
        return null;
    }

    private static LocalDate toLocalDate(Timestamp ts) {
        if (ts == null || ts.getSeconds() == 0) return null;
        return Instant.ofEpochSecond(ts.getSeconds()).atZone(ZoneOffset.UTC).toLocalDate();
    }
}
