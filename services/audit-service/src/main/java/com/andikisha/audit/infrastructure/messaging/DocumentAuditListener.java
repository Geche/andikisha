package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.document.DocumentGeneratedEvent;
import com.andikisha.events.document.DocumentReadyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class DocumentAuditListener {

    private static final Logger log = LoggerFactory.getLogger(DocumentAuditListener.class);
    private final AuditService auditService;

    public DocumentAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.document-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case DocumentGeneratedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.DOCUMENT, AuditAction.GENERATE,
                    "Document", e.getDocumentId(), null, null,
                    e.getDocumentType() + " document generated for employee " + e.getEmployeeId(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case DocumentReadyEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.DOCUMENT, AuditAction.GENERATE,
                    "Document", e.getDocumentId(), null, null,
                    e.getDocumentType() + " document ready: " + e.getFileName()
                            + " for period " + e.getPeriod(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring document event: {}", event.getEventType());
        }
    }
}
