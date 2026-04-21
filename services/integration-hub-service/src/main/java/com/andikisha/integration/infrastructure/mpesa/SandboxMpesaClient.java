package com.andikisha.integration.infrastructure.mpesa;

import com.andikisha.integration.application.port.MpesaClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class SandboxMpesaClient implements MpesaClient {

    private static final Logger log = LoggerFactory.getLogger(SandboxMpesaClient.class);

    private final boolean enabled;

    public SandboxMpesaClient(@Value("${app.mpesa.enabled:false}") boolean enabled) {
        this.enabled = enabled;
    }

    @Override
    public MpesaResponse sendB2C(String shortcode, String initiatorName,
                                 String securityCredential,
                                 String phoneNumber, BigDecimal amount,
                                 String remarks, String occasion,
                                 String callbackUrl, String timeoutUrl) {
        if (!enabled) {
            log.info("M-Pesa sandbox: B2C {} to {} amount KES {}",
                    occasion, phoneNumber, amount);
            String mockConversationId = "AG_" + UUID.randomUUID().toString()
                    .substring(0, 16).toUpperCase();
            return new MpesaResponse(
                    true, mockConversationId, occasion, "0", "Success");
        }

        // Production Daraja API integration:
        //
        // 1. Get OAuth token: POST https://api.safaricom.co.ke/oauth/v1/generate
        //    with Basic Auth (consumerKey:consumerSecret)
        //
        // 2. Send B2C: POST https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest
        //    Headers: Authorization: Bearer {token}

        log.warn("Production M-Pesa API not implemented. Enable sandbox mode.");
        return new MpesaResponse(false, null, null, "999", "Not implemented");
    }

    @Override
    public String getAccessToken(String consumerKey, String consumerSecret) {
        if (!enabled) {
            return "sandbox-token-" + System.currentTimeMillis();
        }
        // Production: POST to /oauth/v1/generate with Basic Auth
        return null;
    }
}
