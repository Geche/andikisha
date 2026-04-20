package com.andikisha.notification.application.service;

import com.andikisha.notification.application.port.EmailSender;
import com.andikisha.notification.application.port.PushSender;
import com.andikisha.notification.application.port.SmsSender;
import com.andikisha.notification.domain.model.Notification;
import com.andikisha.notification.domain.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class NotificationDispatcher {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);

    private final NotificationRepository repository;
    private final EmailSender emailSender;
    private final SmsSender smsSender;
    private final PushSender pushSender;

    public NotificationDispatcher(NotificationRepository repository,
                                  EmailSender emailSender,
                                  SmsSender smsSender,
                                  PushSender pushSender) {
        this.repository = repository;
        this.emailSender = emailSender;
        this.smsSender = smsSender;
        this.pushSender = pushSender;
    }

    /**
     * Dispatches a notification asynchronously in its own transaction.
     * The ID is resolved fresh from the DB so there are no stale-entity issues
     * across transaction boundaries.
     */
    @Async
    @Transactional
    public void dispatchAsync(UUID notificationId) {
        Notification notification = repository.findById(notificationId).orElse(null);
        if (notification == null) {
            log.warn("Notification {} not found for dispatch — skipping", notificationId);
            return;
        }
        dispatch(notification);
    }

    private static String recipientLabel(Notification n) {
        if (n.getRecipientName() != null) return n.getRecipientName();
        if (n.getRecipientEmail() != null) return n.getRecipientEmail();
        return n.getRecipientId() != null ? n.getRecipientId().toString() : "(unknown)";
    }

    @Transactional
    public void dispatch(Notification notification) {
        notification.markSending();
        repository.save(notification);

        try {
            switch (notification.getChannel()) {
                case EMAIL -> emailSender.sendHtml(
                        notification.getRecipientEmail(),
                        notification.getSubject(),
                        notification.getBody());
                case SMS -> smsSender.send(
                        notification.getRecipientPhone(),
                        notification.getBody());
                case PUSH -> pushSender.send(
                        notification.getRecipientId(),
                        notification.getSubject(),
                        notification.getBody());
                case IN_APP -> {} // persisted in DB, retrieved via API
            }

            notification.markSent();
            repository.save(notification);
            log.info("Notification sent via {} to {}: {}",
                    notification.getChannel(),
                    recipientLabel(notification),
                    notification.getSubject());

        } catch (Exception e) {
            notification.markFailed(e.getMessage());
            repository.save(notification);
            log.error("Notification failed via {} to {}: {}",
                    notification.getChannel(),
                    recipientLabel(notification),
                    e.getMessage());
        }
    }
}
