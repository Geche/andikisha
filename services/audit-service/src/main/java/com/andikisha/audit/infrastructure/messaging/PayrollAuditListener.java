package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.events.payroll.PayrollInitiatedEvent;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PayrollAuditListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollAuditListener.class);
    private final AuditService auditService;

    public PayrollAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.payroll-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case PayrollInitiatedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.PAYROLL, AuditAction.CREATE,
                    "PayrollRun", e.getPayrollRunId(), e.getInitiatedBy(), null,
                    "Payroll initiated for period " + e.getPeriod(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case PayrollApprovedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.PAYROLL, AuditAction.APPROVE,
                    "PayrollRun", e.getPayrollRunId(), e.getApprovedBy(), null,
                    "Payroll approved for period " + e.getPeriod()
                            + ". Employees: " + e.getEmployeeCount()
                            + ". Total net: " + e.getTotalNet(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case PayrollProcessedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.PAYROLL, AuditAction.PROCESS,
                    "PayrollRun", e.getPayrollRunId(), null, null,
                    "Payroll processing completed for period " + e.getPeriod(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring payroll event: {}", event.getEventType());
        }
    }
}