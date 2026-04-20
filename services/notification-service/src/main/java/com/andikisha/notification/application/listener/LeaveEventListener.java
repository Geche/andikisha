package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.leave.LeaveApprovedEvent;
import com.andikisha.events.leave.LeaveRejectedEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class LeaveEventListener {

    private static final Logger log = LoggerFactory.getLogger(LeaveEventListener.class);
    private final NotificationService notificationService;

    public LeaveEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.leave-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case LeaveApprovedEvent e -> handleApproved(e);
                case LeaveRejectedEvent e -> handleRejected(e);
                default -> log.debug("Ignoring leave event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleApproved(LeaveApprovedEvent event) {
        String subject = "Leave Request Approved";
        String body = "Your " + event.getLeaveType().toLowerCase()
                + " leave request has been approved.\n\n"
                + "From: " + event.getStartDate() + "\n"
                + "To: " + event.getEndDate() + "\n"
                + "Days: " + event.getDays();

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                null, null, null,
                NotificationChannel.IN_APP,
                "LEAVE", subject, body,
                NotificationPriority.NORMAL,
                event.getEventId(), event.getEventType()
        );
    }

    private void handleRejected(LeaveRejectedEvent event) {
        String subject = "Leave Request Rejected";
        String body = "Your leave request has been rejected.\n\n"
                + "Reason: " + (event.getReason() != null ? event.getReason() : "No reason provided")
                + "\n\nPlease contact your manager or HR for more details.";

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                null, null, null,
                NotificationChannel.IN_APP,
                "LEAVE", subject, body,
                NotificationPriority.NORMAL,
                event.getEventId(), event.getEventType()
        );
    }
}