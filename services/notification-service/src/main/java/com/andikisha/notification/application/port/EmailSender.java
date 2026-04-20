package com.andikisha.notification.application.port;

public interface EmailSender {

    void send(String to, String subject, String body);

    void sendHtml(String to, String subject, String htmlBody);
}