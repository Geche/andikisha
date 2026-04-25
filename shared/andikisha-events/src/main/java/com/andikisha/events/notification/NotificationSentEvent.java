package com.andikisha.events.notification;

import com.andikisha.events.BaseEvent;

public class NotificationSentEvent extends BaseEvent {

    private String notificationId;
    private String recipientId;
    private String channel;

    public NotificationSentEvent(String tenantId, String notificationId,
                                 String recipientId, String channel) {
        super("notification.sent", tenantId);
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.channel = channel;
    }

    protected NotificationSentEvent() { super(); }

    public String getNotificationId() { return notificationId; }
    public String getRecipientId() { return recipientId; }
    public String getChannel() { return channel; }
}