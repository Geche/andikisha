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

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final SecretKey key;

    // Exact paths that require no authentication
    private static final Set<String> PUBLIC_EXACT_PATHS = Set.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/plans",
            "/api/v1/tenants"
    );

    // Path prefixes that require no authentication (all sub-paths)
    private static final List<String> PUBLIC_PREFIX_PATHS = List.of(
            "/api/v1/callbacks/",
            "/actuator/health",
            "/actuator/info",
            "/swagger-ui",
            "/v3/api-docs",
            "/webjars/",
            "/services/"
    );

    public JwtAuthenticationFilter(@Value("${app.jwt.secret}") String jwtSecret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            return chain.filter(exchange);
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

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
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

    private boolean isPublicPath(String path) {
        return PUBLIC_EXACT_PATHS.contains(path)
                || PUBLIC_PREFIX_PATHS.stream().anyMatch(path::startsWith);
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
