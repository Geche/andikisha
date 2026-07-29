package com.andikisha.gateway.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;

import com.andikisha.gateway.config.SecurityConfig;

/**
 * The circuit-breaker fallback for every route must resolve to a 503 handler. The routes forward to
 * {@code forward:/fallback/<full-service-name>} (e.g. /fallback/auth-service, /fallback/
 * time-attendance-service), so the controller mappings must match those exact paths — otherwise an
 * open circuit forwards to an unmapped path and the caller gets a 404 instead of the intended
 * SERVICE_UNAVAILABLE body (GATEWAY-BACKLOG-001).
 */
@WebFluxTest(FallbackController.class)
@Import(SecurityConfig.class)
class FallbackControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    // The exact fallbackUri targets configured on the gateway routes (application.yml).
    @ParameterizedTest
    @ValueSource(strings = {
            "default", "auth-service", "employee-service", "tenant-service",
            "payroll-service", "compliance-service", "time-attendance-service",
            "leave-service", "document-service", "notification-service",
            "integration-hub-service", "analytics-service", "audit-service",
            "recruitment-service"
    })
    void everyRouteFallbackTarget_returns503(String path) {
        webTestClient.get().uri("/fallback/" + path)
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody()
                .jsonPath("$.error").isEqualTo("SERVICE_UNAVAILABLE");
    }

    @Test
    void fallback_carriesServiceNameInBody() {
        webTestClient.get().uri("/fallback/auth-service")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody()
                .jsonPath("$.service").isEqualTo("auth-service");
    }

    @Test
    void fallback_nonGetMethod_returns503() {
        webTestClient.post().uri("/fallback/payroll-service")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
