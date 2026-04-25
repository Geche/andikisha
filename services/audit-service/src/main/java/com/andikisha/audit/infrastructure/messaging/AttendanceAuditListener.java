package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.attendance.ClockInEvent;
import com.andikisha.events.attendance.ClockOutEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class AttendanceAuditListener {

    private static final Logger log = LoggerFactory.getLogger(AttendanceAuditListener.class);
    private final AuditService auditService;

    public AttendanceAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.attendance-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case ClockInEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.ATTENDANCE, AuditAction.ACCESS,
                    "AttendanceRecord", e.getEmployeeId(), e.getEmployeeId(), null,
                    "Clock-in recorded via " + e.getSource(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case ClockOutEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.ATTENDANCE, AuditAction.ACCESS,
                    "AttendanceRecord", e.getEmployeeId(), e.getEmployeeId(), null,
                    "Clock-out recorded. Hours worked: " + e.getHoursWorked(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring attendance event: {}", event.getEventType());
        }
    }
}
