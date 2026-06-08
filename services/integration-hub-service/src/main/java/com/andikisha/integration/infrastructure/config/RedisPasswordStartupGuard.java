package com.andikisha.integration.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Fail-fast guard for the Redis password (2026-06-07 readiness incident).
 *
 * Redis is a soft dependency (health indicator + lazy connection), so a bare
 * ${REDIS_PASSWORD} placeholder that resolves blank lets the service start and
 * only surface as a 503 — re-opening the incident. This asserts the resolved
 * password is present at startup, so a run that did not provide the env
 * (e.g. bare {@code java -jar} without sourcing config/env/<svc>.env) hard-fails.
 *
 * Config-presence only: it does NOT ping Redis. A transient Redis outage must
 * still DEGRADE (per the readiness contract), not block startup.
 */
@Configuration
public class RedisPasswordStartupGuard {

    public RedisPasswordStartupGuard(
            @Value("${spring.data.redis.password:}") String redisPassword) {
        if (redisPassword == null || redisPassword.isBlank() || redisPassword.startsWith("${")) {
            throw new IllegalStateException(
                "spring.data.redis.password is blank/unresolved. Set REDIS_PASSWORD "
                + "(source config/env/<service>.env) before starting — refusing to run "
                + "with an unauthenticated Redis connection.");
        }
    }
}
