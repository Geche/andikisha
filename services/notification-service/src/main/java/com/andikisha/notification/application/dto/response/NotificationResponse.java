package com.andikisha.notification.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID recipientId,
        String recipientName,
        String channel,
        String category,
        String subject,
        String body,
        String status,
        String priority,
        LocalDateTime sentAt,
        String errorMessage,
        int retryCount,
        LocalDateTime createdAt
) {}