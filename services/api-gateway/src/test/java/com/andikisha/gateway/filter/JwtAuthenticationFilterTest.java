package com.andikisha.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Date;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLW9ubHktMzItYnl0ZXMtbG9uZw==";

    private JwtAuthenticationFilter filter;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(TEST_SECRET);
        key = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(TEST_SECRET));
    }

    // ── Missing / malformed Authorization header ───────────────────────────────

    @Test
    void missingAuthorizationHeader_returns401() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void nonBearerAuthorizationHeader_returns401() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // ── Invalid tokens ─────────────────────────────────────────────────────────

    @Test
    void expiredToken_returns401() {
        String token = Jwts.builder()
                .subject("user-1")
                .claim("tenantId", "tenant-1")
                .expiration(new Date(System.currentTimeMillis() - 10_000))
                .signWith(key)
                .compact();

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void tokenMissingTenantIdClaim_returns401() {
        String token = Jwts.builder()
                .subject("user-1")
                .claim("role", "ADMIN")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // ── Public path bypass ─────────────────────────────────────────────────────

    @Test
    void authLoginPath_bypassesAuth() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/auth/login").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void exactTenantsPath_bypassesAuth() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/tenants").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void tenantsSubPath_requiresAuth() {
        // /api/v1/tenants/{uuid} must NOT bypass auth — only exact /api/v1/tenants is public
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/tenants/some-uuid").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void swaggerUiPath_bypassesAuth() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/swagger-ui/index.html").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    // ── Valid token ────────────────────────────────────────────────────────────

    @Test
    void validToken_injectsIdentityHeadersDownstream() {
        String token = Jwts.builder()
                .subject("user-abc")
                .claim("tenantId", "tenant-xyz")
                .claim("role", "MANAGER")
                .claim("email", "alice@acme.com")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());

        GatewayFilterChain chain = mutatedExchange -> {
            assertThat(mutatedExchange.getRequest().getHeaders().getFirst("X-Tenant-ID"))
                    .isEqualTo("tenant-xyz");
            assertThat(mutatedExchange.getRequest().getHeaders().getFirst("X-User-ID"))
                    .isEqualTo("user-abc");
            assertThat(mutatedExchange.getRequest().getHeaders().getFirst("X-User-Role"))
                    .isEqualTo("MANAGER");
            return Mono.empty();
        };

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();
    }

    // ── CB-04: X-Internal-Request header stripping ────────────────────────────

    @Test
    @org.junit.jupiter.api.DisplayName("X-Internal-Request header from external client is stripped before routing (authenticated path)")
    void internalRequestHeader_fromExternalClient_isStripped_onAuthenticatedPath() {
        String token = Jwts.builder()
                .subject("user-super")
                .claim("tenantId", "tenant-super")
                .claim("role", "SUPER_ADMIN")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/super-admin/tenants")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .header("X-Internal-Request", "true")
                        .build());

        AtomicReference<ServerWebExchange> captured = new AtomicReference<>();
        GatewayFilterChain chain = downstream -> {
            captured.set(downstream);
            return Mono.empty();
        };

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(captured.get()).isNotNull();
        assertThat(captured.get().getRequest().getHeaders().get("X-Internal-Request"))
                .as("X-Internal-Request must be stripped from the downstream request")
                .isNullOrEmpty();
    }

    @Test
    @org.junit.jupiter.api.DisplayName("X-Internal-Request header from external client is stripped before routing (public path)")
    void internalRequestHeader_fromExternalClient_isStripped_onPublicPath() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/auth/login")
                        .header("X-Internal-Request", "true")
                        .build());

        AtomicReference<ServerWebExchange> captured = new AtomicReference<>();
        GatewayFilterChain chain = downstream -> {
            captured.set(downstream);
            return Mono.empty();
        };

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(captured.get()).isNotNull();
        assertThat(captured.get().getRequest().getHeaders().get("X-Internal-Request"))
                .as("X-Internal-Request must be stripped from the downstream request on public paths too")
                .isNullOrEmpty();
    }
}
