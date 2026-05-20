package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.tenant.TenantCreatedEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class TenantEventListener {

    private static final Logger log = LoggerFactory.getLogger(TenantEventListener.class);
    private final NotificationService notificationService;

    public TenantEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.tenant-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof TenantCreatedEvent e) {
                handleTenantCreated(e);
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleTenantCreated(TenantCreatedEvent event) {
        String subject = "Welcome to AndikishaHR — your workspace is ready";

        // workspaceSlug can be null if notification-service runs a version ahead of
        // tenant-service during a rolling deploy. Omit the workspace line in that case.
        String workspaceLine = (event.getWorkspaceSlug() != null && !event.getWorkspaceSlug().isBlank())
                ? "  Workspace:  " + event.getWorkspaceSlug() + "\n"
                : "";

        String body = "Dear Admin,\n\n"
                + "Your organisation " + event.getTenantName()
                + " has been registered on AndikishaHR.\n\n"
                + "Sign in details:\n"
                + "  Login URL:  https://app.andikishahr.com/login\n"
                + workspaceLine
                + "  Email:      " + event.getAdminEmail() + "\n"
                + "  Password:   (provided by your Andikisha account manager)\n\n"
                + (workspaceLine.isBlank() ? "" :
                    "Enter the workspace identifier above when you sign in for the first time.\n")
                + "You will be prompted to set a new password immediately after logging in.\n\n"
                + "Your trial period is 14 days. During this time you can:\n"
                + "- Add employees and departments\n"
                + "- Run your first payroll\n"
                + "- Configure leave policies\n"
                + "- Set up statutory registrations (KRA, NSSF, SHIF)\n\n"
                + "Need help getting started? Contact support@andikisha.co.ke";

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.nameUUIDFromBytes(event.getAdminEmail().getBytes(StandardCharsets.UTF_8)),
                null, event.getAdminEmail(), null,
                NotificationChannel.EMAIL,
                "ONBOARDING", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType()
        );

        log.info("Welcome email queued for new tenant: {} (workspace: {})",
                event.getTenantName(), event.getWorkspaceSlug());
    }
}