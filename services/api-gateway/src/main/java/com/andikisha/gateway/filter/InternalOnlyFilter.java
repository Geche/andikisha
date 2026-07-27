package com.andikisha.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Rejects any request lacking {@code X-Internal-Request: true}.
 *
 * <p>The global {@link JwtAuthenticationFilter} strips {@code X-Internal-Request} from every
 * inbound request (anti-spoofing), so a route guarded by this filter cannot be reached through
 * the gateway from outside. Used to keep the SUPER_ADMIN provisioning endpoint gateway-
 * unreachable (SEC-BACKLOG-004); legitimate provisioning is a direct internal call to
 * auth-service and never passes through the gateway.
 *
 * <p>Unlike {@link SuperAdminAuthFilter} this performs no JWT check — the provisioning endpoint
 * is a bootstrap and has no caller to authenticate as.
 */
@Component
public class InternalOnlyFilter
        extends AbstractGatewayFilterFactory<InternalOnlyFilter.Config> {

    private static final String INTERNAL_REQUEST_HEADER = "X-Internal-Request";

    public InternalOnlyFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (!"true".equalsIgnoreCase(
                    exchange.getRequest().getHeaders().getFirst(INTERNAL_REQUEST_HEADER))) {
                return reject(exchange, HttpStatus.FORBIDDEN,
                        "MISSING_INTERNAL_HEADER",
                        "Direct access to this endpoint is not permitted");
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
