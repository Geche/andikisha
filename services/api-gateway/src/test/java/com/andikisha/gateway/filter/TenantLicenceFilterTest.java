package com.andikisha.gateway.filter;

import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.gateway.grpc.TenantLicenceClient;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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

class TenantLicenceFilterTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLW9ubHktMzItYnl0ZXMtbG9uZw==";
    private static final String TENANT_ID = "tenant-abc";

    private TenantLicenceFilter filter;
    private SecretKey key;
    private ReactiveStringRedisTemplate redisTemplate;
    private ReactiveValueOperations<String, String> valueOps;
    private TenantLicenceClient licenceClient;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(ReactiveStringRedisTemplate.class);
        valueOps = mock(ReactiveValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        licenceClient = mock(TenantLicenceClient.class);

        filter = new TenantLicenceFilter(TEST_SECRET, redisTemplate, licenceClient);
        key = Keys.hmacShaKeyFor(decodeSecret(TEST_SECRET));
    }

    private String buildToken(String role, String tenantId, String impersonatedBy) {
        var builder = Jwts.builder()
                .subject("user-1")
                .claim("role", role)
                .claim("tenantId", tenantId)
                .expiration(new Date(System.currentTimeMillis() + 60_000));
        if (impersonatedBy != null) {
            builder.claim("impersonatedBy", impersonatedBy);
        }
        return builder.signWith(key).compact();
    }

    private GatewayFilter gatewayFilter() {
        return filter.apply(new TenantLicenceFilter.Config());
    }

    private void stubRedisStatus(String tenantId, String status) {
        when(valueOps.get(RedisKeys.licenceStatus(tenantId)))
                .thenReturn(status != null ? Mono.just(status) : Mono.empty());
    }

    // ── No auth header — pass through ────────────────────────────────────────

    @Test
    void noAuthHeader_passesThrough() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    // ── Cache miss — read-through to tenant-service ───────────────────────────

    @Test
    void cacheMiss_readThroughActive_passesThrough() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, null);                  // cache miss
        when(licenceClient.fetchStatus(TENANT_ID)).thenReturn("ACTIVE");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
        verify(licenceClient).fetchStatus(TENANT_ID);
    }

    @Test
    void cacheMiss_readThroughNoLicence_returnsForbidden() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, null);
        when(licenceClient.fetchStatus(TENANT_ID)).thenReturn("NONE");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    // ── Cache miss + tenant-service unreachable — asymmetric policy ────────────

    @Test
    void cacheMiss_grpcUnreachable_readFailsOpen() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, null);
        when(licenceClient.fetchStatus(TENANT_ID))
                .thenThrow(new RuntimeException("tenant-service unreachable"));
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")   // READ
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);   // fail open — read served
    }

    @Test
    void cacheMiss_grpcUnreachable_writeFailsClosed() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, null);
        when(licenceClient.fetchStatus(TENANT_ID))
                .thenThrow(new RuntimeException("tenant-service unreachable"));
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/employees")  // WRITE
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        verify(chain, never()).filter(any());
    }

    // ── SUSPENDED licence ─────────────────────────────────────────────────────

    @Test
    void suspendedLicence_returnsForbidden() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, "SUSPENDED");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    @Test
    void expiredLicence_returnsForbidden() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, "EXPIRED");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── GRACE_PERIOD: reads allowed, writes blocked ───────────────────────────

    @Test
    void gracePeriod_getRequest_passesThrough() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, "GRACE_PERIOD");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void gracePeriod_postRequest_returnsForbidden() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, "GRACE_PERIOD");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    // ── SUPER_ADMIN bypass ────────────────────────────────────────────────────

    @Test
    void superAdmin_suspendedLicence_stillPassesThrough() {
        String token = buildToken("SUPER_ADMIN", "SYSTEM", null);
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
        verify(valueOps, never()).get(any());
    }

    // ── Impersonation: write blocked ──────────────────────────────────────────

    @Test
    void impersonationToken_writeRequest_returnsForbidden() {
        String token = buildToken("ADMIN", TENANT_ID, "super-admin-1");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.method(HttpMethod.POST, "/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    @Test
    void impersonationToken_getRequest_passesThrough() {
        String token = buildToken("ADMIN", TENANT_ID, "super-admin-1");
        stubRedisStatus(TENANT_ID, "ACTIVE");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    // ── TRIAL licence ─────────────────────────────────────────────────────────

    @Test
    void trialLicence_postRequest_passesThrough() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, "TRIAL");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    // ── ACTIVE licence ────────────────────────────────────────────────────────

    @Test
    void activeLicence_postRequest_passesThrough() {
        String token = buildToken("ADMIN", TENANT_ID, null);
        stubRedisStatus(TENANT_ID, "ACTIVE");
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    private static byte[] decodeSecret(String secret) {
        return java.util.Base64.getUrlDecoder().decode(secret);
    }
}
