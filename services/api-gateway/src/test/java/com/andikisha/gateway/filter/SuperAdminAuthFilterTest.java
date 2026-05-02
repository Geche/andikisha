package com.andikisha.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SuperAdminAuthFilterTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLW9ubHktMzItYnl0ZXMtbG9uZw==";

    private SuperAdminAuthFilter filter;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        filter = new SuperAdminAuthFilter(TEST_SECRET);
        key = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(TEST_SECRET));
    }

    private String buildToken(String role, String tenantId) {
        return Jwts.builder()
                .subject("user-1")
                .claim("role", role)
                .claim("tenantId", tenantId)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }

    private GatewayFilter gatewayFilter() {
        return filter.apply(new SuperAdminAuthFilter.Config());
    }

    // ── Missing internal header ───────────────────────────────────────────────

    @Test
    void missingInternalHeader_returnsForbidden() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    @Test
    void wrongInternalHeaderValue_returnsForbidden() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header("X-Internal-Request", "false")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── Missing / invalid token ───────────────────────────────────────────────

    @Test
    void missingToken_returnsForbidden() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header("X-Internal-Request", "true")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void invalidToken_returnsForbidden() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header("X-Internal-Request", "true")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not.a.valid.token")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── Wrong role / tenant ───────────────────────────────────────────────────

    @Test
    void regularAdminRole_returnsForbidden() {
        String token = buildToken("ADMIN", "tenant-123");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header("X-Internal-Request", "true")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void superAdminWithWrongTenant_returnsForbidden() {
        String token = buildToken("SUPER_ADMIN", "some-tenant");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header("X-Internal-Request", "true")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── Valid super admin ─────────────────────────────────────────────────────

    @Test
    void validSuperAdminToken_allowsThrough() {
        String token = buildToken("SUPER_ADMIN", "SYSTEM");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header("X-Internal-Request", "true")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }
}
