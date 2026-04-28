package com.andikisha.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Plan-aware rate limiter.
 *
 * Key format from {@link RateLimiterConfig}: {@code {PLAN}:{tenantId}:{sub}}.
 * Parses the plan prefix and resolves the per-plan token-bucket config before
 * delegating to the parent Redis Lua-script executor.
 *
 * Limits (replenish/sec / burst):
 *   STARTER      → 1 / 10
 *   PROFESSIONAL → 5 / 30
 *   ENTERPRISE   → 17 / 100
 *   default      → 1 / 10
 */
public class TenantPlanRateLimiter extends RedisRateLimiter {

    private static final Map<String, int[]> PLAN_LIMITS = Map.of(
            "STARTER",      new int[]{1,  10},
            "PROFESSIONAL", new int[]{5,  30},
            "ENTERPRISE",   new int[]{17, 100}
    );

    public TenantPlanRateLimiter() {
        // Default limits; Spring autowires redisTemplate + script via @Autowired setters
        super(1, 10, 1);
        PLAN_LIMITS.forEach((plan, limits) ->
                getConfig().put(plan, new Config()
                        .setReplenishRate(limits[0])
                        .setBurstCapacity(limits[1])
                        .setRequestedTokens(1)));
    }

    @Override
    public Mono<Response> isAllowed(String routeId, String id) {
        String plan = extractPlan(id);
        // Delegate to parent using plan name as config key (pre-populated above).
        // Falls back to route-level config if plan is unrecognised.
        String configKey = getConfig().containsKey(plan) ? plan : routeId;
        return super.isAllowed(configKey, id);
    }

    private static String extractPlan(String id) {
        if (id == null) return "";
        int sep = id.indexOf(':');
        return sep > 0 ? id.substring(0, sep) : id;
    }
}
