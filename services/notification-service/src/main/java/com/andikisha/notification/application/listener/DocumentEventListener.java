package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.notification.application.port.EmailSender;
import com.andikisha.notification.infrastructure.document.DocumentContentClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Delivers an issued Certificate of Service to the ex-employee by email (#54).
 *
 * <p>On {@code document.ready} for a CERTIFICATE_OF_SERVICE (published only when HR ISSUES it, #56),
 * fetches the PDF from document-service and emails it, with the certificate attached, to the
 * ex-employee's personal email carried on the event. A terminated employee loses portal access, so
 * email is the delivery channel. Decisions: <b>personal email only</b> — if absent, skip and log
 * (HR delivers via the admin download); <b>force-send</b> — a §51 certificate is a statutory
 * offboarding document, so it bypasses channel preferences (sent directly, not via the
 * preference-governed notification store). Payslips are ignored — they have their own self-service.
 */
@Component
public class DocumentEventListener {

    private static final Logger log = LoggerFactory.getLogger(DocumentEventListener.class);
    private static final String CERTIFICATE_OF_SERVICE = "CERTIFICATE_OF_SERVICE";

    private final EmailSender emailSender;
    private final DocumentContentClient documentContentClient;

    public DocumentEventListener(EmailSender emailSender, DocumentContentClient documentContentClient) {
        this.emailSender = emailSender;
        this.documentContentClient = documentContentClient;
    }

    @RabbitListener(queues = "notification.document-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof DocumentReadyEvent e && CERTIFICATE_OF_SERVICE.equals(e.getDocumentType())) {
                deliverCertificate(e);
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void deliverCertificate(DocumentReadyEvent event) {
        String recipient = event.getRecipientEmail();
        if (recipient == null || recipient.isBlank()) {
            log.info("Certificate {} issued but no personal email on record for employee {} — "
                            + "skipping email delivery (HR delivers via download)",
                    event.getDocumentId(), event.getEmployeeId());
            return;
        }

        byte[] pdf;
        try {
            pdf = documentContentClient.download(event.getTenantId(), event.getDocumentId());
        } catch (Exception ex) {
            log.error("Failed to fetch certificate {} for email delivery: {}",
                    event.getDocumentId(), ex.getMessage());
            return;
        }

        String subject = "Your Certificate of Service";
        String body = "<p>Dear former colleague,</p>"
                + "<p>Please find attached your Certificate of Service, issued in accordance with "
                + "Section 51 of the Employment Act, 2007.</p>"
                + "<p>We wish you the best in your future endeavours.</p>";
        String filename = event.getFileName() != null ? event.getFileName() : "certificate-of-service.pdf";

        emailSender.sendWithAttachment(recipient, subject, body, filename, pdf, "application/pdf");
        log.info("Delivered certificate of service {} to {}", event.getDocumentId(), recipient);
    }
}
