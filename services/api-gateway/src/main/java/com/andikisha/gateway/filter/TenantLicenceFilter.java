package com.andikisha.gateway.filter;

import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.gateway.grpc.TenantLicenceClient;
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
import reactor.core.scheduler.Schedulers;

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
    private final TenantLicenceClient licenceClient;

    public TenantLicenceFilter(@Value("${app.jwt.secret}") String secret,
                               ReactiveStringRedisTemplate redisTemplate,
                               TenantLicenceClient licenceClient) {
        super(Config.class);
        byte[] keyBytes = decodeSecret(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.redisTemplate = redisTemplate;
        this.licenceClient = licenceClient;
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
                log.warn("JWT validation failed in TenantLicenceFilter: {}", e.getMessage());
                return reject(exchange, HttpStatus.UNAUTHORIZED,
                        "INVALID_TOKEN", "Invalid or expired token");
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
                return reject(exchange, HttpStatus.UNAUTHORIZED,
                        "MISSING_TENANT_CLAIM", "Token is missing tenantId claim");
            }

            String redisKey = RedisKeys.licenceStatus(tenantId);
            // Optional-wrap so a genuinely empty cache (miss) is distinguishable
            // from enforceLicence completing empty (chain.filter returns Mono<Void>).
            // A naive .flatMap(...).switchIfEmpty(...) would re-run the miss path on
            // every successful pass-through.
            return redisTemplate.opsForValue().get(redisKey)
                    .map(java.util.Optional::of)
                    .defaultIfEmpty(java.util.Optional.empty())
                    .flatMap(maybeStatus -> maybeStatus
                            .map(status -> enforceLicence(exchange, chain, tenantId, status))
                            .orElseGet(() -> readThroughOnMiss(exchange, chain, tenantId)));
        };
    }

    /**
     * Cache-miss read-through. Calls tenant-service's licence RPC (which also
     * repopulates the Redis key), then enforces the returned status.
     *
     * <p>If tenant-service is unreachable the policy is asymmetric (decision
     * 2026-06-08-licence-read-through): READS fail OPEN with an audit log so a
     * transient outage never blocks data the user is allowed to see; WRITES fail
     * CLOSED with {@code LICENCE_CHECK_UNAVAILABLE} since an unverified licence
     * must not gate a mutation.
     */
    private Mono<Void> readThroughOnMiss(ServerWebExchange exchange,
                                         org.springframework.cloud.gateway.filter.GatewayFilterChain chain,
                                         String tenantId) {
        return Mono.fromCallable(() -> {
                    try {
                        return licenceClient.fetchStatus(tenantId);
                    } catch (RuntimeException ex) {
                        // Wrap so onErrorResume below catches ONLY the gRPC failure,
                        // never an error bubbling up from the proxied downstream call.
                        throw new ReadThroughFailure(ex);
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(status -> enforceLicence(exchange, chain, tenantId, status))
                .onErrorResume(ReadThroughFailure.class, e -> {
                    if (isWriteMethod(exchange)) {
                        log.warn("Licence read-through failed for tenant {}; failing CLOSED (write): {}",
                                tenantId, e.getCause().toString());
                        return reject(exchange, HttpStatus.SERVICE_UNAVAILABLE,
                                "LICENCE_CHECK_UNAVAILABLE",
                                "Licence status unavailable. Please retry shortly.");
                    }
                    log.warn("AUDIT licence-fail-open: tenant {} READ served without licence "
                                    + "validation (tenant-service unreachable): {}",
                            tenantId, e.getCause().toString());
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> enforceLicence(ServerWebExchange exchange,
                                      org.springframework.cloud.gateway.filter.GatewayFilterChain chain,
                                      String tenantId,
                                      String status) {
        return switch (status) {
            case "NONE" ->
                    reject(exchange, HttpStatus.FORBIDDEN,
                            "LICENCE_NONE",
                            "No active licence found for this organisation. Please contact support.");
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
        return java.util.Base64.getUrlDecoder().decode(secret);
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public static class Config {}

    /** Marks a tenant-service read-through (gRPC) failure so the asymmetric
     *  read-open / write-closed policy applies only to that failure — not to
     *  errors propagating from the proxied downstream service. */
    private static final class ReadThroughFailure extends RuntimeException {
        ReadThroughFailure(Throwable cause) { super(cause); }
    }
}
