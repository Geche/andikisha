package com.andikisha.gateway.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Date;

class RateLimiterConfigTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLW9ubHktMzItYnl0ZXMtbG9uZw==";

    private KeyResolver keyResolver;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        keyResolver = new RateLimiterConfig(TEST_SECRET).userKeyResolver();
        key = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(TEST_SECRET));
    }

    private String buildToken(String plan, String tenantId, String sub) {
        return Jwts.builder()
                .subject(sub)
                .claim("plan", plan)
                .claim("tenantId", tenantId)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }

    @Test
    void validJwtWithPlan_returnsPlanPrefixedKey() {
        String token = buildToken("STARTER", "tenant-abc", "user-123");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("STARTER:tenant-abc:user-123")
                .verifyComplete();
    }

    @Test
    void professionalPlan_returnsCorrectKey() {
        String token = buildToken("PROFESSIONAL", "tenant-xyz", "user-456");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/payroll")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("PROFESSIONAL:tenant-xyz:user-456")
                .verifyComplete();
    }

    @Test
    void missingAuthHeader_fallsBackToIp() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/auth/login").build());

        // MockServerHttpRequest has no remote address — falls back to "unknown"
        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("ANON:unknown")
                .verifyComplete();
    }

    @Test
    void invalidToken_fallsBackToIp() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not.a.valid.token")
                        .build());

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNextMatches(key -> key.startsWith("ANON:"))
                .verifyComplete();
    }

    @Test
    void tokenMissingPlanClaim_fallsBackToIp() {
        String token = Jwts.builder()
                .subject("user-1")
                .claim("tenantId", "tenant-abc")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNextMatches(k -> k.startsWith("ANON:"))
                .verifyComplete();
    }
}
