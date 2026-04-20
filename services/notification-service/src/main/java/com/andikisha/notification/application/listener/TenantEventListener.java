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
        String subject = "Welcome to AndikishaHR";
        String body = "Dear Admin,\n\n"
                + "Your organisation " + event.getTenantName()
                + " has been registered on AndikishaHR.\n\n"
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

        log.info("Welcome email queued for new tenant: {}", event.getTenantName());
    }
}