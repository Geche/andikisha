package com.andikisha.notification.application.mapper;

import com.andikisha.notification.application.dto.response.NotificationResponse;
import com.andikisha.notification.domain.model.Notification;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T19:57:07+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification n) {
        if ( n == null ) {
            return null;
        }

        UUID id = null;
        UUID recipientId = null;
        String recipientName = null;
        String category = null;
        String subject = null;
        String body = null;
        LocalDateTime sentAt = null;
        String errorMessage = null;
        int retryCount = 0;
        LocalDateTime createdAt = null;

        id = n.getId();
        recipientId = n.getRecipientId();
        recipientName = n.getRecipientName();
        category = n.getCategory();
        subject = n.getSubject();
        body = n.getBody();
        sentAt = n.getSentAt();
        errorMessage = n.getErrorMessage();
        retryCount = n.getRetryCount();
        createdAt = n.getCreatedAt();

        String channel = n.getChannel().name();
        String status = n.getStatus().name();
        String priority = n.getPriority().name();

        NotificationResponse notificationResponse = new NotificationResponse( id, recipientId, recipientName, channel, category, subject, body, status, priority, sentAt, errorMessage, retryCount, createdAt );

        return notificationResponse;
    }
}
