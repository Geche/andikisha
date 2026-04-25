package com.andikisha.gateway.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;

import com.andikisha.gateway.config.SecurityConfig;

@WebFluxTest(FallbackController.class)
@Import(SecurityConfig.class)
class FallbackControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void defaultFallback_returns503() {
        webTestClient.get().uri("/fallback/default")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody()
                .jsonPath("$.error").isEqualTo("SERVICE_UNAVAILABLE");
    }

    @Test
    void authFallback_get_returns503WithServiceName() {
        webTestClient.get().uri("/fallback/auth")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody()
                .jsonPath("$.error").isEqualTo("SERVICE_UNAVAILABLE")
                .jsonPath("$.service").isEqualTo("auth-service");
    }

    @Test
    void payrollFallback_post_returns503() {
        webTestClient.post().uri("/fallback/payroll")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void auditFallback_returns503() {
        webTestClient.get().uri("/fallback/audit")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody()
                .jsonPath("$.service").isEqualTo("audit-service");
    }

    @Test
    void analyticsFallback_put_returns503() {
        webTestClient.put().uri("/fallback/analytics")
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }
}
