package com.andikisha.notification.application.port;

public interface SmsSender {

    void send(String phoneNumber, String message);
}