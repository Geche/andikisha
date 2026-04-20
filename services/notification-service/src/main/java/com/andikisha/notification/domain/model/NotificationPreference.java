package com.andikisha.notification.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

@Entity
@Table(name = "notification_preferences",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "user_id", "category"}))
public class NotificationPreference extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    private boolean smsEnabled = true;

    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    private boolean inAppEnabled = true;

    protected NotificationPreference() {}

    public static NotificationPreference create(String tenantId, UUID userId,
                                                String category) {
        NotificationPreference pref = new NotificationPreference();
        pref.setTenantId(tenantId);
        pref.userId = userId;
        pref.category = category;
        return pref;
    }

    public boolean isChannelEnabled(NotificationChannel channel) {
        return switch (channel) {
            case EMAIL -> emailEnabled;
            case SMS -> smsEnabled;
            case PUSH -> pushEnabled;
            case IN_APP -> inAppEnabled;
        };
    }

    public UUID getUserId() { return userId; }
    public String getCategory() { return category; }
    public boolean isEmailEnabled() { return emailEnabled; }
    public boolean isSmsEnabled() { return smsEnabled; }
    public boolean isPushEnabled() { return pushEnabled; }
    public boolean isInAppEnabled() { return inAppEnabled; }
}