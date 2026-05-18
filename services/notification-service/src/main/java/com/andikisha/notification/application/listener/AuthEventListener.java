package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.auth.EmployeeUserProvisionedEvent;
import com.andikisha.events.auth.PasswordResetRequestedEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuthEventListener.class);

    private final NotificationService notificationService;
    private final String portalUrl;

    public AuthEventListener(NotificationService notificationService,
                             @Value("${app.portal-url:http://localhost:3000}") String portalUrl) {
        this.notificationService = notificationService;
        this.portalUrl = portalUrl;
    }

    @RabbitListener(queues = "notification.auth-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case EmployeeUserProvisionedEvent e -> handleProvisioned(e);
                case PasswordResetRequestedEvent e  -> handlePasswordReset(e);
                default -> log.debug("Ignoring auth event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleProvisioned(EmployeeUserProvisionedEvent event) {
        String subject = "Welcome to AndikishaHR — Your Account is Ready";
        String body = "Dear " + event.getFirstName() + " " + event.getLastName() + ",\n\n"
                + "Welcome aboard! Your employee number is " + event.getEmployeeNumber() + ".\n\n"
                + "Your account has been created. Use the details below to log in:\n\n"
                + "  Portal:   " + portalUrl + "\n"
                + "  Email:    " + event.getEmail() + "\n"
                + "  Password: " + event.getTempPassword() + "\n\n"
                + "You will be asked to set a new password when you first log in.\n\n"
                + "If you have any questions, contact the HR department.";

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                event.getFirstName() + " " + event.getLastName(),
                event.getEmail(),
                null,
                NotificationChannel.EMAIL,
                "ONBOARDING", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType());
    }

    private void handlePasswordReset(PasswordResetRequestedEvent event) {
        String resetUrl = portalUrl + "/reset-password/" + event.getResetToken();
        String subject = "Reset Your AndikishaHR Password";
        String body = "You requested a password reset.\n\n"
                + "Click the link below to set a new password (expires in 1 hour):\n\n"
                + "  " + resetUrl + "\n\n"
                + "If you did not request this, you can safely ignore this email.";

        notificationService.sendNotification(
                event.getTenantId(),
                null,
                null,
                event.getEmail(),
                null,
                NotificationChannel.EMAIL,
                "SECURITY", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType());
    }
}
