package com.andikisha.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import com.andikisha.gateway.config.GatewayPublicPaths;
import com.andikisha.common.security.InternalAuthToken;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";
    private static final long INTERNAL_AUTH_SKEW_SECONDS = 30;

    private final SecretKey key;
    /**
     * Signs the identity headers as {@code X-Internal-Auth} (audit M1/M2), so services can verify
     * they came from the gateway. Null when {@code INTERNAL_SIGNING_SECRET} is unset — signing is
     * skipped so the rollout stays safe (services verify in log-only mode until the secret is set
     * everywhere and enforcement is turned on).
     */
    private final InternalAuthToken internalAuth;

    public JwtAuthenticationFilter(@Value("${app.jwt.secret}") String jwtSecret,
                                   @Value("${app.internal-auth.secret:}") String internalSecret) {
        this.key = Keys.hmacShaKeyFor(decodeSecret(jwtSecret));
        if (internalSecret != null && internalSecret.length() >= 16) {
            this.internalAuth = new InternalAuthToken(
                    internalSecret.getBytes(StandardCharsets.UTF_8), INTERNAL_AUTH_SKEW_SECONDS);
        } else {
            this.internalAuth = null;
            log.warn("INTERNAL_SIGNING_SECRET not set — X-Internal-Auth signing disabled "
                    + "(services must run in log-only trusted-header mode)");
        }
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            // Strip the X-Internal-Request and X-Internal-Auth headers from the inbound request
            // before routing. This prevents external clients from forging these sentinels even on
            // routes that override default-filters (e.g. super-admin-routes).
            ServerWebExchange sanitised = exchange.mutate()
                    .request(r -> r.headers(h -> {
                        h.remove("X-Internal-Request");
                        h.remove(INTERNAL_AUTH_HEADER);
                    }))
                    .build();
            return chain.filter(sanitised);
        }

        String authHeader = exchange.getRequest().getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "MISSING_TOKEN", "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.getSubject();
            String tenantId = claims.get("tenantId", String.class);
            String role = claims.get("role", String.class);
            String email = claims.get("email", String.class);
            String employeeId = claims.get("employeeId", String.class);

            if (tenantId == null || tenantId.isBlank()) {
                return unauthorized(exchange, "MISSING_TENANT_CLAIM", "Token missing tenantId claim");
            }

            // Assertion: non-SUPER_ADMIN authenticated users should always carry an employeeId.
            // Logs but does NOT block — surfaces any remaining gap without breaking flows.
            if ((employeeId == null || employeeId.isBlank())
                    && !"SUPER_ADMIN".equals(role)) {
                log.warn("Authenticated user has no employeeId in JWT: userId={} role={} path={}",
                        userId, role, path);
            }

            // Strip any client-supplied identity headers BEFORE setting validated values
            // to prevent spoofing (mutate().header() appends, not replaces).
            // Also strip X-Internal-Request and X-Internal-Auth so external clients cannot forge
            // these sentinels on routes whose per-route filters override default-filters.
            final String userIdH = userId != null ? userId : "";
            final String roleH = role != null ? role : "";
            final String emailH = email != null ? email : "";
            final String employeeIdH = employeeId != null ? employeeId : "";

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-User-ID");
                        h.remove("X-Tenant-ID");
                        h.remove("X-User-Role");
                        h.remove("X-User-Email");
                        h.remove("X-Employee-ID");
                        h.remove("X-Internal-Request");
                        h.remove(INTERNAL_AUTH_HEADER);

                        h.add("X-User-ID", userIdH);
                        h.add("X-Tenant-ID", tenantId);
                        h.add("X-User-Role", roleH);
                        h.add("X-User-Email", emailH);
                        h.add("X-Employee-ID", employeeIdH);

                        // Attest the injected identity (audit M1/M2). Bind the exact header VALUES,
                        // in this fixed order, so a service can verify none was tampered with in
                        // transit. Skipped when no secret is configured (safe rollout).
                        if (internalAuth != null) {
                            h.add(INTERNAL_AUTH_HEADER, internalAuth.sign(
                                    Instant.now().getEpochSecond(),
                                    userIdH, tenantId, roleH, emailH, employeeIdH));
                        }
                    })
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return unauthorized(exchange, "INVALID_TOKEN", "Invalid or expired token");
        }
    }

    @Override
    public int getOrder() {
        return -100;
    }

    private static byte[] decodeSecret(String secret) {
        return java.util.Base64.getUrlDecoder().decode(secret);
    }

    private boolean isPublicPath(String path) {
        return GatewayPublicPaths.EXACT.contains(path)
                || GatewayPublicPaths.PREFIXES.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String code, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"status\":401,\"code\":\"%s\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
                escapeJson(code), escapeJson(message), java.time.Instant.now());
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(bytes)));
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
