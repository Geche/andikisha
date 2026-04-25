package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import com.andikisha.events.employee.EmployeeUpdatedEvent;
import com.andikisha.events.employee.SalaryChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EmployeeAuditListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeAuditListener.class);
    private final AuditService auditService;

    public EmployeeAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.employee-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case EmployeeCreatedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.EMPLOYEE, AuditAction.CREATE,
                    "Employee", e.getEmployeeId(), null, null,
                    "Employee created: " + e.getFirstName() + " " + e.getLastName()
                            + " (" + e.getEmployeeNumber() + ")",
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case EmployeeUpdatedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.EMPLOYEE, AuditAction.UPDATE,
                    "Employee", e.getEmployeeId(), e.getUpdatedBy(), null,
                    "Employee profile updated",
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case EmployeeTerminatedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.EMPLOYEE, AuditAction.DELETE,
                    "Employee", e.getEmployeeId(), e.getTerminatedBy(), null,
                    "Employee terminated: " + e.getReason(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case SalaryChangedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.EMPLOYEE, AuditAction.UPDATE,
                    "Salary", e.getEmployeeId(), e.getChangedBy(), null,
                    "Salary changed from " + e.getOldSalary() + " to " + e.getNewSalary()
                            + " " + e.getCurrency(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring employee event: {}", event.getEventType());
        }
    }
}