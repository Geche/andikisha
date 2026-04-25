package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.auth.UserDeactivatedEvent;
import com.andikisha.events.auth.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class AuthAuditListener {

    private static final Logger log = LoggerFactory.getLogger(AuthAuditListener.class);
    private final AuditService auditService;

    public AuthAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.auth-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case UserRegisteredEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.AUTH, AuditAction.CREATE,
                    "User", e.getUserId(), null, null,
                    "User registered: " + e.getEmail() + " with role " + e.getRole(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case UserDeactivatedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.AUTH, AuditAction.DELETE,
                    "User", e.getUserId(), null, null,
                    "User deactivated",
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring auth event: {}", event.getEventType());
        }
    }
}