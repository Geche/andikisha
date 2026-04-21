package com.andikisha.integration.application.port;

import java.math.BigDecimal;

public interface MpesaClient {

    MpesaResponse sendB2C(String shortcode, String initiatorName,
                          String securityCredential,
                          String phoneNumber, BigDecimal amount,
                          String remarks, String occasion,
                          String callbackUrl, String timeoutUrl);

    String getAccessToken(String consumerKey, String consumerSecret);

    record MpesaResponse(
            boolean success,
            String conversationId,
            String originatorConversationId,
            String responseCode,
            String responseDescription
    ) {}
}