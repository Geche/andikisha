package com.andikisha.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
public class SuperAdminAuthFilter
        extends AbstractGatewayFilterFactory<SuperAdminAuthFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminAuthFilter.class);
    private static final String INTERNAL_REQUEST_HEADER = "X-Internal-Request";

    private final SecretKey key;

    public SuperAdminAuthFilter(@Value("${app.jwt.secret}") String secret) {
        super(Config.class);
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (!"true".equalsIgnoreCase(
                    exchange.getRequest().getHeaders().getFirst(INTERNAL_REQUEST_HEADER))) {
                return reject(exchange, HttpStatus.FORBIDDEN,
                        "MISSING_INTERNAL_HEADER",
                        "Direct access to super-admin endpoints is not permitted");
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return reject(exchange, HttpStatus.FORBIDDEN,
                        "MISSING_TOKEN", "Authentication required");
            }

            try {
                Claims claims = Jwts.parser().verifyWith(key).build()
                        .parseSignedClaims(authHeader.substring(7)).getPayload();

                String role = claims.get("role", String.class);
                String tenantId = claims.get("tenantId", String.class);

                if (!"SUPER_ADMIN".equals(role) || !"SYSTEM".equals(tenantId)) {
                    return reject(exchange, HttpStatus.FORBIDDEN,
                            "INSUFFICIENT_ROLE",
                            "Super Admin role required for this endpoint");
                }
            } catch (JwtException e) {
                return reject(exchange, HttpStatus.FORBIDDEN, "INVALID_TOKEN", "Invalid token");
            }

            return chain.filter(exchange);
        };
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

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public static class Config {}
}
