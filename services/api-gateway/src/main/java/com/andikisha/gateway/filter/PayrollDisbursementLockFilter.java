package com.andikisha.gateway.filter;

import com.andikisha.common.infrastructure.cache.RedisKeys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

@Component
public class PayrollDisbursementLockFilter
        extends AbstractGatewayFilterFactory<PayrollDisbursementLockFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(PayrollDisbursementLockFilter.class);
    private static final Duration LOCK_TTL = Duration.ofMinutes(30);
    private static final String DISBURSE_PATH_SUFFIX = "/disburse";

    private final SecretKey key;
    private final ReactiveStringRedisTemplate redisTemplate;

    public PayrollDisbursementLockFilter(@Value("${app.jwt.secret}") String secret,
                                         ReactiveStringRedisTemplate redisTemplate) {
        super(Config.class);
        byte[] keyBytes = decodeSecret(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Only apply to POST requests ending in /disburse
            if (!HttpMethod.POST.equals(exchange.getRequest().getMethod())) {
                return chain.filter(exchange);
            }
            String path = exchange.getRequest().getPath().value();
            if (!path.endsWith(DISBURSE_PATH_SUFFIX)) {
                return chain.filter(exchange);
            }

            String tenantId = extractTenantId(exchange);
            if (tenantId == null) {
                return chain.filter(exchange);
            }

            String lockKey = RedisKeys.payrollDisbursementLock(tenantId);

            return redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, "1", LOCK_TTL)
                    .flatMap(acquired -> {
                        if (Boolean.TRUE.equals(acquired)) {
                            return chain.filter(exchange);
                        }
                        return reject(exchange);
                    });
        };
    }

    private String extractTenantId(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(authHeader.substring(7)).getPayload();
            return claims.get("tenantId", String.class);
        } catch (JwtException e) {
            return null;
        }
    }

    private Mono<Void> reject(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.CONFLICT);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"status\":409"
                + ",\"code\":\"PAYROLL_DISBURSEMENT_IN_PROGRESS\""
                + ",\"message\":\"A payroll disbursement is already in progress for this organisation.\""
                + ",\"timestamp\":\"" + Instant.now() + "\"}";
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    private static byte[] decodeSecret(String secret) {
        String normalised = secret.replace('-', '+').replace('_', '/');
        return java.util.Base64.getDecoder().decode(normalised);
    }

    public static class Config {}
}
