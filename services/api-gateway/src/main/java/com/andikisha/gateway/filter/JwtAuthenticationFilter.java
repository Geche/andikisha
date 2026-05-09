package com.andikisha.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import com.andikisha.gateway.config.GatewayPublicPaths;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final SecretKey key;

    public JwtAuthenticationFilter(@Value("${app.jwt.secret}") String jwtSecret) {
        this.key = Keys.hmacShaKeyFor(decodeSecret(jwtSecret));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            // Strip the X-Internal-Request header from the inbound request before routing.
            // This prevents external clients from forging this sentinel header even on routes
            // that override default-filters (e.g. super-admin-routes).
            ServerWebExchange sanitised = exchange.mutate()
                    .request(r -> r.headers(h -> h.remove("X-Internal-Request")))
                    .build();
            return chain.filter(sanitised);
        }

        String authHeader = exchange.getRequest().getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or invalid Authorization header");
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
                return unauthorized(exchange, "Token missing tenantId claim");
            }

            // Strip any client-supplied identity headers BEFORE setting validated values
            // to prevent spoofing (mutate().header() appends, not replaces).
            // Also strip X-Internal-Request so external clients cannot forge this sentinel
            // on routes whose per-route filters override default-filters.
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-User-ID");
                        h.remove("X-Tenant-ID");
                        h.remove("X-User-Role");
                        h.remove("X-User-Email");
                        h.remove("X-Employee-ID");
                        h.remove("X-Internal-Request");
                    })
                    .header("X-User-ID", userId)
                    .header("X-Tenant-ID", tenantId)
                    .header("X-User-Role", role != null ? role : "")
                    .header("X-User-Email", email != null ? email : "")
                    .header("X-Employee-ID", employeeId != null ? employeeId : "")
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return unauthorized(exchange, "Invalid or expired token");
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

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        // Use replace to escape any quotes in the message to prevent JSON injection
        String safeMessage = message.replace("\\", "\\\\").replace("\"", "\\\"");
        byte[] body = ("{\"error\":\"UNAUTHORIZED\",\"message\":\"" + safeMessage + "\"}")
                .getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }
}
