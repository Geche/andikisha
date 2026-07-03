package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Notifies an employee when a document is ready to download.
 *
 * The {@code document.ready} routing key is emitted for every document type (payslips included),
 * so this listener filters to CERTIFICATE_OF_SERVICE only — payslips have their own self-service
 * surface and must not trigger a notification per generated slip.
 */
@Component
public class DocumentEventListener {

    private static final Logger log = LoggerFactory.getLogger(DocumentEventListener.class);
    private static final String CERTIFICATE_OF_SERVICE = "CERTIFICATE_OF_SERVICE";

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
                notifyCertificateReady(e);
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void notifyCertificateReady(DocumentReadyEvent event) {
        String subject = "Certificate of Service Available";
        String body = "Your Certificate of Service is now ready to download from your documents.";

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                null, null, null,
                NotificationChannel.IN_APP,
                "OFFBOARDING", subject, body,
                NotificationPriority.NORMAL,
                event.getEventId(), event.getEventType()
        );
        log.info("Notified employee {} that certificate of service is ready", event.getEmployeeId());
    }
}
