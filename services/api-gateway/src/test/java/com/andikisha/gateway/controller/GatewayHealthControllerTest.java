package com.andikisha.gateway.controller;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GatewayHealthControllerTest {

    @SuppressWarnings("unchecked")
    private GatewayHealthController buildController(Mono<String> serviceResponse) {
        WebClient webClient = mock(WebClient.class, RETURNS_DEEP_STUBS);
        when(webClient.get().uri(anyString()).retrieve().bodyToMono(String.class))
                .thenReturn(serviceResponse);

        WebClient.Builder builder = mock(WebClient.Builder.class);
        when(builder.build()).thenReturn(webClient);

        return new GatewayHealthController(
                builder,
                "http://auth", "http://employee", "http://tenant",
                "http://payroll", "http://compliance", "http://attendance",
                "http://leave", "http://document", "http://notification",
                "http://integration", "http://analytics", "http://audit"
        );
    }

    @Test
    void aggregatedHealth_alwaysIncludesGatewayUp() {
        WebTestClient client = WebTestClient.bindToController(
                buildController(Mono.just("{\"status\":\"UP\"}"))).build();

        client.get().uri("/api/v1/gateway/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.gateway").isEqualTo("UP");
    }

    @Test
    void aggregatedHealth_includesAllTwelveServices() {
        WebTestClient client = WebTestClient.bindToController(
                buildController(Mono.just("{\"status\":\"UP\"}"))).build();

        client.get().uri("/api/v1/gateway/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.['auth-service']").exists()
                .jsonPath("$.['employee-service']").exists()
                .jsonPath("$.['tenant-service']").exists()
                .jsonPath("$.['payroll-service']").exists()
                .jsonPath("$.['compliance-service']").exists()
                .jsonPath("$.['time-attendance-service']").exists()
                .jsonPath("$.['leave-service']").exists()
                .jsonPath("$.['document-service']").exists()
                .jsonPath("$.['notification-service']").exists()
                .jsonPath("$.['integration-hub-service']").exists()
                .jsonPath("$.['analytics-service']").exists()
                .jsonPath("$.['audit-service']").exists();
    }

    @Test
    void aggregatedHealth_reachableService_markedUp() {
        WebTestClient client = WebTestClient.bindToController(
                buildController(Mono.just("{\"status\":\"UP\"}"))).build();

        client.get().uri("/api/v1/gateway/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.['auth-service']").isEqualTo("UP");
    }

    @Test
    void aggregatedHealth_unreachableService_markedDown() {
        WebTestClient client = WebTestClient.bindToController(
                buildController(Mono.error(new RuntimeException("connection refused")))).build();

        client.get().uri("/api/v1/gateway/health")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.['auth-service']").isEqualTo("DOWN")
                .jsonPath("$.gateway").isEqualTo("UP");
    }
}
