package com.andikisha.notification.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications")
public record NotificationProperties(
        Email email,
        Sms sms
) {
    public record Email(String from, String fromName) {}
    public record Sms(String apiKey, String username, String senderId, boolean enabled) {}
}
