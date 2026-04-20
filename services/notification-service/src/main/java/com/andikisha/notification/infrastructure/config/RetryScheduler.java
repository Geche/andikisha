package com.andikisha.notification.infrastructure.config;

import com.andikisha.notification.application.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RetryScheduler {

    private static final Logger log = LoggerFactory.getLogger(RetryScheduler.class);
    private final NotificationService notificationService;

    public RetryScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 60000) // Every 60 seconds
    public void retryFailedNotifications() {
        notificationService.retryFailed();
    }
}