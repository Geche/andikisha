package com.andikisha.integration.presentation.controller;

import com.andikisha.integration.application.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/callbacks/mpesa")
public class MpesaCallbackController {

    private static final Logger log = LoggerFactory.getLogger(MpesaCallbackController.class);
    private static final Map<String, String> ACCEPTED = Map.of("ResultCode", "0", "ResultDesc", "Accepted");
    private static final Map<String, String> FORBIDDEN = Map.of("ResultCode", "1", "ResultDesc", "Forbidden");

    private final PaymentService paymentService;

    /**
     * Shared secret embedded in the callback URL path (audit H2). Safaricom B2C result/timeout
     * callbacks are unsigned, so the endpoint is unauthenticated by necessity; a high-entropy secret
     * path segment — validated constant-time — is the authenticity control that keeps an attacker who
     * reaches the pod from forging payment confirmations. The registered Safaricom ResultURL/
     * QueueTimeOutURL must carry this secret. Blank (unset) fails closed: every callback is rejected.
     */
    private final String callbackSecret;

    public MpesaCallbackController(PaymentService paymentService,
                                   @Value("${app.mpesa.callback.secret:}") String callbackSecret) {
        this.paymentService = paymentService;
        this.callbackSecret = callbackSecret;
    }

    @PostMapping("/b2c/result/{secret}")
    public ResponseEntity<Map<String, String>> handleResult(@PathVariable String secret,
                                                            @RequestBody Map<String, Object> payload) {
        if (!secretValid(secret)) {
            log.warn("Rejected M-Pesa B2C result callback — invalid callback secret");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(FORBIDDEN);
        }
        log.info("M-Pesa B2C result callback received");

        String conversationId = null;
        try {
            Map<String, Object> result = extractResult(payload);
            conversationId = (String) result.get("ConversationID");
            int resultCode = ((Number) result.get("ResultCode")).intValue();

            if (resultCode == 0) {
                String receipt = extractReceipt(result);
                paymentService.handleMpesaCallback(conversationId, true,
                        receipt, null, null);
            } else {
                String desc = (String) result.get("ResultDesc");
                paymentService.handleMpesaCallback(conversationId, false,
                        null, String.valueOf(resultCode), desc);
            }
        } catch (Exception e) {
            log.error("Failed to process M-Pesa callback [conversationId={}] payload={}: {}",
                    conversationId, payload, e.getMessage(), e);
        }

        return ResponseEntity.ok(ACCEPTED);
    }

    @PostMapping("/b2c/timeout/{secret}")
    public ResponseEntity<Map<String, String>> handleTimeout(@PathVariable String secret,
                                                             @RequestBody Map<String, Object> payload) {
        if (!secretValid(secret)) {
            log.warn("Rejected M-Pesa B2C timeout callback — invalid callback secret");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(FORBIDDEN);
        }
        log.warn("M-Pesa B2C timeout callback received: {}", payload);
        return ResponseEntity.ok(ACCEPTED);
    }

    /** Constant-time comparison; blank configured secret fails closed. */
    private boolean secretValid(String provided) {
        if (callbackSecret == null || callbackSecret.isBlank() || provided == null) {
            return false;
        }
        return MessageDigest.isEqual(
                provided.getBytes(StandardCharsets.UTF_8),
                callbackSecret.getBytes(StandardCharsets.UTF_8));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractResult(Map<String, Object> payload) {
        return (Map<String, Object>) payload.get("Result");
    }

    @SuppressWarnings("unchecked")
    private String extractReceipt(Map<String, Object> result) {
        try {
            Map<String, Object> params =
                    (Map<String, Object>) result.get("ResultParameters");
            var paramList = (java.util.List<Map<String, Object>>)
                    params.get("ResultParameter");
            for (var param : paramList) {
                if ("TransactionReceipt".equals(param.get("Key"))) {
                    return param.get("Value").toString();
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract receipt from callback");
        }
        return null;
    }
}