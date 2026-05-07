package com.andikisha.gateway.filter;

import com.andikisha.gateway.config.GatewayPublicPaths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class TenantValidationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(TenantValidationFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isExemptPath(path)) {
            return chain.filter(exchange);
        }

        String tenantId = exchange.getRequest().getHeaders().getFirst("X-Tenant-ID");

        if (tenantId == null || tenantId.isBlank()) {
            log.warn("Missing X-Tenant-ID header for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.BAD_REQUEST);
            exchange.getResponse().getHeaders().add("Content-Type", "application/json");
            byte[] body = "{\"error\":\"MISSING_TENANT\",\"message\":\"X-Tenant-ID header is required\"}"
                    .getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(
                    Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -90;
    }

    private boolean isExemptPath(String path) {
        return GatewayPublicPaths.EXACT.contains(path)
                || GatewayPublicPaths.PREFIXES.stream().anyMatch(path::startsWith);
    }
}
