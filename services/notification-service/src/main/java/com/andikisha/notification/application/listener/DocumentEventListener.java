package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.notification.application.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code document.ready} (emitted for every document type) and is where the ex-employee
 * Certificate of Service notification will be sent.
 *
 * <p><b>Currently suppressed (#42).</b> The Certificate of Service is not yet production-issuable:
 * the PDF generator is stubbed (returns raw HTML, not a PDF) and the employer name is a
 * placeholder, and CERTIFICATE_OF_SERVICE is not in the document self-service download allowlist —
 * so an employee cannot actually retrieve it. Sending a "ready to download" notification would
 * promise an action the system denies, so nothing is emitted until the certificate is real.
 *
 * <p><b>Target design (#42):</b> email the ex-employee's {@code personalEmail} with the certificate
 * attached — a terminated employee loses portal access, so IN_APP is the wrong channel. Enable once
 * (1) the real PDF renderer lands, (2) the employer name is resolved via tenant-service, and
 * (3) the personal email is available to notification-service (event/proto carries it, or a lookup
 * is added). Payslips are intentionally ignored here — they have their own self-service surface.
 */
@Component
public class DocumentEventListener {

    private static final Logger log = LoggerFactory.getLogger(DocumentEventListener.class);
    private static final String CERTIFICATE_OF_SERVICE = "CERTIFICATE_OF_SERVICE";

    // Retained for the target design (#42): the re-enabled path will notify through this.
    @SuppressWarnings("unused")
    private final NotificationService notificationService;

    public DocumentEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.document-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof DocumentReadyEvent e
                    && CERTIFICATE_OF_SERVICE.equals(e.getDocumentType())
                    && e.getEmployeeId() != null) {
                // #42: suppressed until the certificate is production-issuable and deliverable.
                // Do NOT notify here — see the class Javadoc for the target design.
                log.info("Certificate of service ready for employee {} — notification suppressed pending #42",
                        e.getEmployeeId());
            }
        } finally {
            TenantContext.clear();
        }
    }
}
