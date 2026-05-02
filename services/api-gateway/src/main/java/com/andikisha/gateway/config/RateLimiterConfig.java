package com.andikisha.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;

@Configuration
public class RateLimiterConfig {

    private final SecretKey key;

    public RateLimiterConfig(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(secret));
    }

    /**
     * Key format: {@code {PLAN}:{tenantId}:{sub}}.
     * The plan prefix is used by {@link TenantPlanRateLimiter} to apply
     * tier-specific replenish/burst limits.
     */
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String authHeader = exchange.getRequest().getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    Claims claims = Jwts.parser().verifyWith(key).build()
                            .parseSignedClaims(authHeader.substring(7)).getPayload();
                    String plan = claims.get("plan", String.class);
                    String tenantId = claims.get("tenantId", String.class);
                    String sub = claims.getSubject();
                    if (plan != null && tenantId != null && sub != null) {
                        return Mono.just(plan + ":" + tenantId + ":" + sub);
                    }
                } catch (JwtException ignored) {
                    // Fall through to IP-based key
                }
            }
            String ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
            return Mono.just("ANON:" + ip);
        };
    }

    @Bean
    @Primary
    public RedisRateLimiter planAwareRateLimiter() {
        return new TenantPlanRateLimiter();
    }
}
