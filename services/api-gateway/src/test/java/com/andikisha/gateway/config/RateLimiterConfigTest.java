package com.andikisha.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.test.StepVerifier;

class RateLimiterConfigTest {

    private KeyResolver keyResolver;

    @BeforeEach
    void setUp() {
        keyResolver = new RateLimiterConfig().userKeyResolver();
    }

    @Test
    void bothHeadersPresent_returnsCompoundKey() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header("X-Tenant-ID", "tenant-abc")
                        .header("X-User-ID", "user-123")
                        .build());

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("tenant-abc:user-123")
                .verifyComplete();
    }

    @Test
    void missingTenantId_fallsBackToIp() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header("X-User-ID", "user-123")
                        .build());

        // No X-Tenant-ID — must fall back to IP, not produce "null:user-123"
        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNextMatches(key -> !key.startsWith("null:") && !key.contains("null"))
                .verifyComplete();
    }

    @Test
    void missingUserId_fallsBackToIp() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/auth/login")
                        .header("X-Tenant-ID", "tenant-abc")
                        .build());

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNextMatches(key -> !key.contains(":"))
                .verifyComplete();
    }

    @Test
    void bothHeadersMissing_fallsBackToIp() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/auth/login").build());

        // MockServerHttpRequest has no remote address — expects "unknown"
        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("unknown")
                .verifyComplete();
    }
}
