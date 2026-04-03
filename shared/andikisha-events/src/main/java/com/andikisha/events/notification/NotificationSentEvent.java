package com.andikisha.events.notification;

import com.andikisha.events.BaseEvent;

public class NotificationSentEvent extends BaseEvent {

    private final String notificationId;
    private final String recipientId;
    private final String channel;

    public NotificationSentEvent(String tenantId, String notificationId,
                                 String recipientId, String channel) {
        super("notification.sent", tenantId);
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.channel = channel;
    }

    protected NotificationSentEvent() { super(); this.notificationId = null; this.recipientId = null; this.channel = null; }

    public String getNotificationId() { return notificationId; }
    public String getRecipientId() { return recipientId; }
    public String getChannel() { return channel; }
}