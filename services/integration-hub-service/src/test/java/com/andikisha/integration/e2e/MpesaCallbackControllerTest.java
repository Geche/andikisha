package com.andikisha.integration.e2e;

import com.andikisha.integration.application.service.PaymentService;
import com.andikisha.integration.infrastructure.config.SecurityConfig;
import com.andikisha.integration.presentation.controller.MpesaCallbackController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MpesaCallbackController.class)
@Import({SecurityConfig.class, WebMvcTestSecurityConfig.class})
@TestPropertySource(properties = "app.mpesa.callback.secret=test-callback-secret")
class MpesaCallbackControllerTest {

    private static final String SECRET = "test-callback-secret";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean PaymentService paymentService;

    @Test
    void handleResult_successCallback_returns200AndAccepted() throws Exception {
        Map<String, Object> payload = buildSuccessPayload("AG_CONV123456789", "QGH7YK3BXY");

        mockMvc.perform(post("/api/v1/callbacks/mpesa/b2c/result/" + SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ResultCode").value("0"))
                .andExpect(jsonPath("$.ResultDesc").value("Accepted"));

        verify(paymentService).handleMpesaCallback(
                eq("AG_CONV123456789"), eq(true), eq("QGH7YK3BXY"), eq(null), eq(null));
    }

    @Test
    void handleResult_failureCallback_invokesServiceWithErrorDetails() throws Exception {
        Map<String, Object> payload = buildFailurePayload("AG_CONV999999999", 2001, "Insufficient funds");

        mockMvc.perform(post("/api/v1/callbacks/mpesa/b2c/result/" + SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ResultCode").value("0"));

        verify(paymentService).handleMpesaCallback(
                eq("AG_CONV999999999"), eq(false), eq(null), eq("2001"), eq("Insufficient funds"));
    }

    @Test
    void handleResult_malformedPayload_stillReturns200ToSafaricom() throws Exception {
        // Safaricom expects 200 always; the controller swallows exceptions
        mockMvc.perform(post("/api/v1/callbacks/mpesa/b2c/result/" + SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ResultCode").value("0"));
    }

    @Test
    void handleTimeout_alwaysReturns200() throws Exception {
        mockMvc.perform(post("/api/v1/callbacks/mpesa/b2c/timeout/" + SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("TimeoutPayload", "data"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ResultCode").value("0"));
    }

    @Test
    void handleResult_noTenantHeaderRequired_callbackEndpointIsPublic() throws Exception {
        // Callbacks come from Safaricom — no X-Tenant-ID header
        Map<String, Object> payload = buildSuccessPayload("AG_CONV000000001", "RECEIPT001");

        mockMvc.perform(post("/api/v1/callbacks/mpesa/b2c/result/" + SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    @Test
    void handleResult_wrongSecret_returns403AndDoesNotInvokeService() throws Exception {
        // Safaricom B2C callbacks are unsigned; the secret path segment is the authenticity control.
        // A forged callback with the wrong secret must be rejected and must not touch payment state.
        Map<String, Object> payload = buildSuccessPayload("AG_CONV_FORGED", "FORGEDRCPT");

        mockMvc.perform(post("/api/v1/callbacks/mpesa/b2c/result/wrong-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());

        verify(paymentService, never()).handleMpesaCallback(
                any(), anyBoolean(), any(), any(), any());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Map<String, Object> buildSuccessPayload(String conversationId, String receipt) {
        return Map.of("Result", Map.of(
                "ConversationID", conversationId,
                "ResultCode", 0,
                "ResultDesc", "The service request is processed successfully",
                "ResultParameters", Map.of(
                        "ResultParameter", List.of(
                                Map.of("Key", "TransactionReceipt", "Value", receipt),
                                Map.of("Key", "TransactionAmount", "Value", 50000)
                        )
                )
        ));
    }

    private Map<String, Object> buildFailurePayload(String conversationId,
                                                     int resultCode, String desc) {
        return Map.of("Result", Map.of(
                "ConversationID", conversationId,
                "ResultCode", resultCode,
                "ResultDesc", desc
        ));
    }
}
