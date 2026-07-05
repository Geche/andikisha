package com.andikisha.notification.application.port;

public interface EmailSender {

    void send(String to, String subject, String body);

    void sendHtml(String to, String subject, String htmlBody);

    void sendWithAttachment(String to, String subject, String htmlBody,
                            String attachmentName, byte[] attachment, String attachmentContentType);
}