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
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
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
        key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET));
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
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void exactTenantsPath_bypassesAuth() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/tenants").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

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
        when(chain.filter(exchange)).thenReturn(Mono.empty());

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
}
