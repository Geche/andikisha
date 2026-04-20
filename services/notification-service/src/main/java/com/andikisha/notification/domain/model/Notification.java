package com.andikisha.notification.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    @Column(name = "recipient_name", length = 200)
    private String recipientName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NotificationPriority priority;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NotificationStatus status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "max_retries", nullable = false)
    private int maxRetries = 3;

    @Column(name = "source_event_id", length = 100)
    private String sourceEventId;

    @Column(name = "source_event_type", length = 100)
    private String sourceEventType;

    protected Notification() {}

    public static Notification create(String tenantId, UUID recipientId,
                                      String recipientName, String recipientEmail,
                                      String recipientPhone,
                                      NotificationChannel channel,
                                      String category, String subject, String body,
                                      NotificationPriority priority,
                                      String sourceEventId, String sourceEventType) {
        Notification n = new Notification();
        n.setTenantId(tenantId);
        n.recipientId = recipientId;
        n.recipientName = recipientName;
        n.recipientEmail = recipientEmail;
        n.recipientPhone = recipientPhone;
        n.channel = channel;
        n.category = category;
        n.subject = subject;
        n.body = body;
        n.priority = priority;
        n.status = NotificationStatus.PENDING;
        n.sourceEventId = sourceEventId;
        n.sourceEventType = sourceEventType;
        return n;
    }

    public void markSending() {
        this.status = NotificationStatus.SENDING;
    }

    public void markSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }

    public void markFailed(String error) {
        this.retryCount++;
        this.errorMessage = error;
        if (this.retryCount >= this.maxRetries) {
            this.status = NotificationStatus.FAILED;
        } else {
            this.status = NotificationStatus.RETRYING;
        }
    }

    public boolean canRetry() {
        return retryCount < maxRetries
                && status != NotificationStatus.SENT
                && status != NotificationStatus.FAILED;
    }

    public UUID getRecipientId() { return recipientId; }
    public String getRecipientEmail() { return recipientEmail; }
    public String getRecipientPhone() { return recipientPhone; }
    public String getRecipientName() { return recipientName; }
    public NotificationChannel getChannel() { return channel; }
    public NotificationPriority getPriority() { return priority; }
    public String getCategory() { return category; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public NotificationStatus getStatus() { return status; }
    public LocalDateTime getSentAt() { return sentAt; }
    public String getErrorMessage() { return errorMessage; }
    public int getRetryCount() { return retryCount; }
    public String getSourceEventId() { return sourceEventId; }
    public String getSourceEventType() { return sourceEventType; }
}