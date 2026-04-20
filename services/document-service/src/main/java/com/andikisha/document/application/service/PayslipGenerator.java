package com.andikisha.document.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.port.DocumentEventPublisher;
import com.andikisha.document.application.port.FileStorage;
import com.andikisha.document.application.port.PdfGenerator;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PayslipGenerator {

    private static final Logger log = LoggerFactory.getLogger(PayslipGenerator.class);

    private final DocumentPersistenceHelper persistenceHelper;
    private final PayslipHtmlBuilder htmlBuilder;
    private final PdfGenerator pdfGenerator;
    private final FileStorage fileStorage;
    private final DocumentEventPublisher eventPublisher;

    public PayslipGenerator(DocumentPersistenceHelper persistenceHelper,
                            PayslipHtmlBuilder htmlBuilder,
                            PdfGenerator pdfGenerator,
                            FileStorage fileStorage,
                            DocumentEventPublisher eventPublisher) {
        this.persistenceHelper = persistenceHelper;
        this.htmlBuilder = htmlBuilder;
        this.pdfGenerator = pdfGenerator;
        this.fileStorage = fileStorage;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Generates a payslip PDF asynchronously.
     *
     * Three distinct transaction boundaries keep DB connections short:
     *   1. createGenerating  — persist GENERATING record, transaction commits immediately.
     *   2. PDF render + file store — pure I/O, no transaction open.
     *   3. markReady / markFailed — single-row status update, transaction commits.
     *
     * TenantContext is set explicitly because @Async executes on a separate thread
     * where the caller's ThreadLocal is not inherited.
     */
    @Async("documentTaskExecutor")
    public void generateAsync(String tenantId, UUID payrollRunId,
                              UUID employeeId, String employeeName,
                              String employeeNumber, String period,
                              Map<String, BigDecimal> earnings,
                              Map<String, BigDecimal> deductions,
                              Map<String, BigDecimal> reliefs,
                              BigDecimal grossPay, BigDecimal netPay) {

        TenantContext.setTenantId(tenantId);
        try {
            String fileName  = String.format("payslip_%s_%s_%s.pdf",
                    employeeNumber, period, UUID.randomUUID());
            String filePath  = String.format("%s/payslips/%s/%s", tenantId, period, fileName);
            String title     = "Payslip - " + period + " - " + employeeName;

            // Transaction 1: persist GENERATING record and commit.
            Document doc = persistenceHelper.createGenerating(
                    tenantId, employeeId, employeeName,
                    DocumentType.PAYSLIP, title, fileName, filePath, "application/pdf",
                    period, payrollRunId, "SYSTEM");

            try {
                // I/O outside any transaction — DB connection is free.
                String html     = htmlBuilder.build(employeeName, employeeNumber, period,
                        earnings, deductions, reliefs, grossPay, netPay);
                byte[] pdfBytes = pdfGenerator.generateFromHtml(html);
                fileStorage.store(filePath, pdfBytes);

                // Transaction 2: mark READY and commit.
                Document ready = persistenceHelper.markReady(doc.getId(), pdfBytes.length);
                eventPublisher.publishDocumentReady(ready);

                log.info("Payslip generated for {} period {}: {} bytes",
                        employeeName, period, pdfBytes.length);

            } catch (Exception e) {
                // Transaction 3: mark FAILED and commit.
                persistenceHelper.markFailed(doc.getId(), e.getMessage());
                log.error("Failed to generate payslip for {} period {}: {}",
                        employeeName, period, e.getMessage());
            }

        } finally {
            TenantContext.clear();
        }
    }
}
