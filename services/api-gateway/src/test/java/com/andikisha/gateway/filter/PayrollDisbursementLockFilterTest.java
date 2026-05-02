package com.andikisha.gateway.filter;

import com.andikisha.common.infrastructure.cache.RedisKeys;
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

class PayrollDisbursementLockFilterTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLW9ubHktMzItYnl0ZXMtbG9uZw==";
    private static final String TENANT_ID = "tenant-xyz";

    private PayrollDisbursementLockFilter filter;
    private SecretKey key;
    private ReactiveStringRedisTemplate redisTemplate;
    private ReactiveValueOperations<String, String> valueOps;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(ReactiveStringRedisTemplate.class);
        valueOps = mock(ReactiveValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);

        filter = new PayrollDisbursementLockFilter(TEST_SECRET, redisTemplate);
        key = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(TEST_SECRET));
    }

    private String buildToken(String tenantId) {
        return Jwts.builder()
                .subject("user-1")
                .claim("role", "ADMIN")
                .claim("tenantId", tenantId)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }

    private GatewayFilter gatewayFilter() {
        return filter.apply(new PayrollDisbursementLockFilter.Config());
    }

    // ── Non-POST requests are never blocked ───────────────────────────────────

    @Test
    void getRequest_toDisbursePath_passesThrough() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/payroll/runs/1/disburse").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
        verify(valueOps, never()).setIfAbsent(any(), any(), any());
    }

    // ── Non-disburse POST paths pass through ──────────────────────────────────

    @Test
    void postRequest_nonDisbursePath_passesThrough() {
        String token = buildToken(TENANT_ID);
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/payroll/runs")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
        verify(valueOps, never()).setIfAbsent(any(), any(), any());
    }

    // ── Lock acquisition ──────────────────────────────────────────────────────

    @Test
    void postDisburse_lockAcquired_passesThrough() {
        String token = buildToken(TENANT_ID);
        String lockKey = RedisKeys.payrollDisbursementLock(TENANT_ID);
        when(valueOps.setIfAbsent(any(), any(), any())).thenReturn(Mono.just(true));

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/payroll/runs/run-1/disburse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    @Test
    void postDisburse_lockAlreadyHeld_returnsConflict() {
        String token = buildToken(TENANT_ID);
        when(valueOps.setIfAbsent(any(), any(), any())).thenReturn(Mono.just(false));

        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/payroll/runs/run-1/disburse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        verify(chain, never()).filter(any());
    }

    // ── Missing / invalid token ───────────────────────────────────────────────

    @Test
    void postDisburse_noToken_passesThrough() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/payroll/runs/run-1/disburse").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
        verify(valueOps, never()).setIfAbsent(any(), any(), any());
    }

    @Test
    void postDisburse_invalidToken_passesThrough() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/payroll/runs/run-1/disburse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.token")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }
}
