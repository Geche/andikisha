package com.andikisha.audit.infrastructure.messaging;

import com.andikisha.audit.application.service.AuditService;
import com.andikisha.audit.domain.model.AuditAction;
import com.andikisha.audit.domain.model.AuditDomain;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.leave.LeaveApprovedEvent;
import com.andikisha.events.leave.LeaveRejectedEvent;
import com.andikisha.events.leave.LeaveRequestedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class LeaveAuditListener {

    private static final Logger log = LoggerFactory.getLogger(LeaveAuditListener.class);
    private final AuditService auditService;

    public LeaveAuditListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @RabbitListener(queues = "audit.leave-events")
    public void handle(BaseEvent event) {
        switch (event) {
            case LeaveRequestedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.LEAVE, AuditAction.SUBMIT,
                    "LeaveRequest", e.getLeaveRequestId(), e.getEmployeeId(), null,
                    e.getLeaveType() + " leave requested: " + e.getDays()
                            + " days from " + e.getStartDate() + " to " + e.getEndDate(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case LeaveApprovedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.LEAVE, AuditAction.APPROVE,
                    "LeaveRequest", e.getLeaveRequestId(), e.getApprovedBy(), null,
                    e.getLeaveType() + " leave approved for employee " + e.getEmployeeId()
                            + ". " + e.getDays() + " days from " + e.getStartDate()
                            + " to " + e.getEndDate(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            case LeaveRejectedEvent e -> auditService.record(
                    e.getTenantId(), AuditDomain.LEAVE, AuditAction.REJECT,
                    "LeaveRequest", e.getLeaveRequestId(), e.getRejectedBy(), null,
                    "Leave rejected for employee " + e.getEmployeeId()
                            + ". Reason: " + e.getReason(),
                    e.getEventType(), e.getEventId(), null, e.getTimestamp());

            default -> log.debug("Ignoring leave event: {}", event.getEventType());
        }
    }
}