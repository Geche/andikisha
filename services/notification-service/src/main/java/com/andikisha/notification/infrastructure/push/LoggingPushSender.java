package com.andikisha.notification.infrastructure.push;

import com.andikisha.notification.application.port.PushSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class LoggingPushSender implements PushSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingPushSender.class);

    @Override
    public void send(UUID userId, String title, String body) {
        // Firebase Cloud Messaging integration goes here in production.
        // For now, log the notification.
        log.info("Push notification for user {}: {} - {}", userId, title, body);
    }
}