package com.andikisha.notification.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.notification.application.dto.response.NotificationResponse;
import com.andikisha.notification.application.mapper.NotificationMapper;
import com.andikisha.notification.domain.model.Notification;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPreference;
import com.andikisha.notification.domain.model.NotificationPriority;
import com.andikisha.notification.domain.model.NotificationStatus;
import com.andikisha.notification.domain.repository.NotificationPreferenceRepository;
import com.andikisha.notification.domain.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final int RETRY_BATCH_SIZE = 100;
    private static final int STALE_NOTIFICATION_MINUTES = 5;

    private final NotificationRepository repository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationMapper mapper;
    private final NotificationDispatcher dispatcher;

    public NotificationService(NotificationRepository repository,
                               NotificationPreferenceRepository preferenceRepository,
                               NotificationMapper mapper,
                               NotificationDispatcher dispatcher) {
        this.repository = repository;
        this.preferenceRepository = preferenceRepository;
        this.mapper = mapper;
        this.dispatcher = dispatcher;
    }

    @Transactional
    public void sendNotification(String tenantId, UUID recipientId,
                                 String recipientName, String recipientEmail,
                                 String recipientPhone,
                                 NotificationChannel channel,
                                 String category, String subject, String body,
                                 NotificationPriority priority,
                                 String sourceEventId, String sourceEventType) {

        // I5: Idempotency — skip if same event+channel already delivered for this tenant
        if (sourceEventId != null && !sourceEventId.isBlank() &&
                repository.existsByTenantIdAndSourceEventIdAndChannel(tenantId, sourceEventId, channel)) {
            log.debug("Duplicate notification skipped: sourceEventId={} channel={}", sourceEventId, channel);
            return;
        }

        // I4: Honour user channel preferences (EMAIL, SMS, PUSH only — IN_APP always stored)
        if (recipientId != null && channel != NotificationChannel.IN_APP) {
            Optional<NotificationPreference> pref =
                    preferenceRepository.findByTenantIdAndUserIdAndCategory(tenantId, recipientId, category);
            if (pref.isPresent() && !pref.get().isChannelEnabled(channel)) {
                log.debug("Notification skipped: recipient {} opted out of {} for {}",
                        recipientId, channel, category);
                return;
            }
        }

        Notification notification = Notification.create(
                tenantId, recipientId, recipientName, recipientEmail,
                recipientPhone, channel, category, subject, body,
                priority, sourceEventId, sourceEventType);

        Notification saved = repository.save(notification);

        // I2: Dispatch only after the current transaction commits so the dispatcher
        // can find the notification by ID in its own separate transaction.
        final UUID notificationId = saved.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatcher.dispatchAsync(notificationId);
                }
            });
        } else {
            dispatcher.dispatchAsync(notificationId);
        }
    }

    @Transactional
    public void sendMultiChannel(String tenantId, UUID recipientId,
                                 String recipientName, String recipientEmail,
                                 String recipientPhone,
                                 String category, String subject, String body,
                                 NotificationPriority priority,
                                 String sourceEventId, String sourceEventType) {

        if (recipientEmail != null && !recipientEmail.isBlank()) {
            sendNotification(tenantId, recipientId, recipientName,
                    recipientEmail, recipientPhone, NotificationChannel.EMAIL,
                    category, subject, body, priority, sourceEventId, sourceEventType);
        }

        if (recipientPhone != null && !recipientPhone.isBlank()) {
            String smsBody = subject + ": " + truncateForSms(body);
            sendNotification(tenantId, recipientId, recipientName,
                    recipientEmail, recipientPhone, NotificationChannel.SMS,
                    category, subject, smsBody, priority, sourceEventId, sourceEventType);
        }

        sendNotification(tenantId, recipientId, recipientName,
                recipientEmail, recipientPhone, NotificationChannel.IN_APP,
                category, subject, body, priority, sourceEventId, sourceEventType);
    }

    @Transactional
    public void retryFailed() {
        // I3: Include stale PENDING (missed dispatch) and SENDING (JVM crash) alongside RETRYING
        LocalDateTime staleThreshold = LocalDateTime.now().minusMinutes(STALE_NOTIFICATION_MINUTES);
        List<Notification> retryable = repository.findRetryableNotifications(
                staleThreshold, PageRequest.of(0, RETRY_BATCH_SIZE));

        int dispatched = 0;
        for (Notification notification : retryable) {
            if (notification.canRetry()) {
                dispatcher.dispatchAsync(notification.getId());
                dispatched++;
            }
        }

        log.info("Retried {} notifications", dispatched);
    }

    public Page<NotificationResponse> getForRecipient(UUID recipientId,
                                                      Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdAndRecipientIdOrderByCreatedAtDesc(
                        tenantId, recipientId, pageable)
                .map(mapper::toResponse);
    }

    public Page<NotificationResponse> listAll(Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(mapper::toResponse);
    }

    public long countUnread(UUID recipientId) {
        String tenantId = TenantContext.requireTenantId();
        return repository.countByTenantIdAndRecipientIdAndStatus(
                tenantId, recipientId, NotificationStatus.SENT);
    }

    private String truncateForSms(String text) {
        if (text == null) return "";
        return text.length() > 160 ? text.substring(0, 157) + "..." : text;
    }
}
