package com.andikisha.integration.presentation.controller;

import com.andikisha.integration.application.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/callbacks/mpesa")
public class MpesaCallbackController {

    private static final Logger log = LoggerFactory.getLogger(MpesaCallbackController.class);
    private final PaymentService paymentService;

    public MpesaCallbackController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/b2c/result")
    public Map<String, String> handleResult(@RequestBody Map<String, Object> payload) {
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

        return Map.of("ResultCode", "0", "ResultDesc", "Accepted");
    }

    @PostMapping("/b2c/timeout")
    public Map<String, String> handleTimeout(@RequestBody Map<String, Object> payload) {
        log.warn("M-Pesa B2C timeout callback received: {}", payload);
        return Map.of("ResultCode", "0", "ResultDesc", "Accepted");
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