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
import java.time.Instant;
import java.util.Set;

@Component
public class TenantLicenceFilter
        extends AbstractGatewayFilterFactory<TenantLicenceFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(TenantLicenceFilter.class);

    private static final Set<HttpMethod> WRITE_METHODS = Set.of(
            HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE);

    private final SecretKey key;
    private final ReactiveStringRedisTemplate redisTemplate;

    public TenantLicenceFilter(@Value("${app.jwt.secret}") String secret,
                               ReactiveStringRedisTemplate redisTemplate) {
        super(Config.class);
        byte[] keyBytes = decodeSecret(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return chain.filter(exchange);
            }

            Claims claims;
            try {
                claims = Jwts.parser().verifyWith(key).build()
                        .parseSignedClaims(authHeader.substring(7)).getPayload();
            } catch (JwtException e) {
                return chain.filter(exchange);
            }

            // SUPER_ADMIN bypasses all licence checks
            if ("SUPER_ADMIN".equals(claims.get("role", String.class))) {
                return chain.filter(exchange);
            }

            // Impersonation tokens are read-only
            String impersonatedBy = claims.get("impersonatedBy", String.class);
            if (impersonatedBy != null && isWriteMethod(exchange)) {
                return reject(exchange, HttpStatus.FORBIDDEN,
                        "IMPERSONATION_WRITE_BLOCKED",
                        "Write operations are not permitted during tenant impersonation sessions.");
            }

            String tenantId = claims.get("tenantId", String.class);
            if (tenantId == null) {
                return chain.filter(exchange);
            }

            String redisKey = RedisKeys.licenceStatus(tenantId);
            return redisTemplate.opsForValue().get(redisKey)
                    .defaultIfEmpty("ACTIVE") // Cache miss — treat as active
                    .flatMap(status -> enforceLicence(exchange, chain, status));
        };
    }

    private Mono<Void> enforceLicence(ServerWebExchange exchange,
                                      org.springframework.cloud.gateway.filter.GatewayFilterChain chain,
                                      String status) {
        return switch (status) {
            case "SUSPENDED", "EXPIRED", "CANCELLED" ->
                    reject(exchange, HttpStatus.FORBIDDEN,
                            "LICENCE_SUSPENDED",
                            "This organisation's licence is " + status.toLowerCase()
                                    + ". Please contact support.");
            case "GRACE_PERIOD" -> {
                if (isWriteMethod(exchange)) {
                    yield reject(exchange, HttpStatus.FORBIDDEN,
                            "LICENCE_GRACE_PERIOD_WRITE_BLOCKED",
                            "Write operations are suspended. Your licence has expired — "
                                    + "please renew to restore full access.");
                }
                yield chain.filter(exchange);
            }
            default -> chain.filter(exchange);
        };
    }

    private boolean isWriteMethod(ServerWebExchange exchange) {
        return WRITE_METHODS.contains(exchange.getRequest().getMethod());
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status,
                              String code, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"status\":" + status.value()
                + ",\"code\":\"" + escapeJson(code) + "\""
                + ",\"message\":\"" + escapeJson(message) + "\""
                + ",\"timestamp\":\"" + Instant.now() + "\"}";
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    private static byte[] decodeSecret(String secret) {
        String normalised = secret.replace('-', '+').replace('_', '/');
        return java.util.Base64.getDecoder().decode(normalised);
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public static class Config {}
}
