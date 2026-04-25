package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.payroll.PaymentCompletedEvent;
import com.andikisha.events.payroll.PaymentFailedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class IntegrationAuditListener {

    private static final Logger log = LoggerFactory.getLogger(IntegrationAuditListener.class);
    private final AuditService auditService;

    public IntegrationAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.integration-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case PaymentCompletedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.INTEGRATION, AuditAction.DISBURSE,
                    "Payment", e.getPaySlipId(), null, null,
                    "Payment completed via " + e.getPaymentMethod()
                            + " for employee " + e.getEmployeeId()
                            + ". Receipt: " + e.getProviderReceipt(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case PaymentFailedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.INTEGRATION, AuditAction.DISBURSE,
                    "Payment", e.getPaySlipId(), null, null,
                    "Payment failed via " + e.getPaymentMethod()
                            + " for employee " + e.getEmployeeId()
                            + ". Error [" + e.getErrorCode() + "]: " + e.getErrorMessage(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring integration event: {}", event.getEventType());
        }
    }
}
