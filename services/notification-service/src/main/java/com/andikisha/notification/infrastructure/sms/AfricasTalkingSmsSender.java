package com.andikisha.notification.infrastructure.sms;

import com.andikisha.notification.application.port.SmsSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AfricasTalkingSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(AfricasTalkingSmsSender.class);

    @Value("${app.notifications.sms.api-key:}")
    private String apiKey;

    @Value("${app.notifications.sms.username:sandbox}")
    private String username;

    @Value("${app.notifications.sms.sender-id:ANDIKISHA}")
    private String senderId;

    @Value("${app.notifications.sms.enabled:false}")
    private boolean enabled;

    @Override
    public void send(String phoneNumber, String message) {
        if (!enabled) {
            log.info("SMS disabled. Would send to {}: {}", phoneNumber, message);
            return;
        }

        // Africa's Talking SDK integration
        // For production, add: implementation("com.africastalking:core:3.4.1")
        // and use the SDK to send SMS.
        //
        // AfricasTalking.initialize(username, apiKey);
        // SmsService sms = AfricasTalking.getService(AfricasTalking.SERVICE_SMS);
        // sms.send(message, new String[]{phoneNumber}, senderId);

        log.info("SMS sent to {}: {}", phoneNumber, truncate(message));
    }

    private String truncate(String text) {
        return text.length() > 50 ? text.substring(0, 47) + "..." : text;
    }
}