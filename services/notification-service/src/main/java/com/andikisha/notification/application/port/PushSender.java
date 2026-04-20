package com.andikisha.notification.application.port;

import java.util.UUID;

public interface PushSender {

    void send(UUID userId, String title, String body);
}