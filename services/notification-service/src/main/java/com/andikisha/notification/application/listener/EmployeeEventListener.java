package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class EmployeeEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeEventListener.class);
    private final NotificationService notificationService;

    public EmployeeEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.employee-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case EmployeeCreatedEvent e -> handleCreated(e);
                case EmployeeTerminatedEvent e -> handleTerminated(e);
                default -> log.debug("Ignoring employee event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleCreated(EmployeeCreatedEvent event) {
        String subject = "Welcome to AndikishaHR";
        String body = "Dear " + event.getFirstName() + " " + event.getLastName() + ",\n\n"
                + "Welcome aboard! Your employee number is " + event.getEmployeeNumber() + ".\n\n"
                + "You can access the employee portal to view your payslips, "
                + "submit leave requests, and update your profile.\n\n"
                + "If you have any questions, please contact the HR department.";

        notificationService.sendMultiChannel(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                event.getFirstName() + " " + event.getLastName(),
                event.getEmail(),
                event.getPhoneNumber(),
                "ONBOARDING", subject, body,
                NotificationPriority.NORMAL,
                event.getEventId(), event.getEventType()
        );
    }

    private void handleTerminated(EmployeeTerminatedEvent event) {
        String subject = "Employment Status Update";
        String body = "Your employment status has been updated. "
                + "Please contact HR for details regarding your exit process, "
                + "final pay, and certificate of service.";

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                null, null, null,
                NotificationChannel.IN_APP,
                "OFFBOARDING", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType()
        );
    }
}