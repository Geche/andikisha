package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.tenant.TenantCreatedEvent;
import com.andikisha.events.tenant.TenantSuspendedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TenantAuditListener {

    private static final Logger log = LoggerFactory.getLogger(TenantAuditListener.class);
    private final AuditService auditService;

    public TenantAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.tenant-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case TenantCreatedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.TENANT, AuditAction.CREATE,
                    "Tenant", e.getTenantId(), null, null,
                    "Tenant registered: " + e.getTenantName() + " (" + e.getCountry()
                            + "). Plan: " + e.getPlan(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case TenantSuspendedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.TENANT, AuditAction.UPDATE,
                    "Tenant", e.getTenantId(), null, null,
                    "Tenant suspended. Reason: " + e.getReason(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring tenant event: {}", event.getEventType());
        }
    }
}