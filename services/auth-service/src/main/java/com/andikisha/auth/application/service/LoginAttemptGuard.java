package com.andikisha.auth.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Per-(scope, identifier, client IP) failed-login throttle backed by Redis (audit M5/M6).
 *
 * <p>Caps how many failed login attempts a single source IP may make against a single account
 * within a sliding window, so an attacker cannot cheaply reach the 30-minute account-lockout
 * threshold (M6) or run a low-per-account password spray (M5). It is keyed on the client IP AND the
 * account identifier so throttling one attacker source does not lock a legitimate user logging in
 * from a different IP. This is the fine-grained, server-side complement to the gateway's coarse
 * per-IP volumetric limit — the gateway limit keys on the non-spoofable socket IP, this keys on the
 * account too. Failed attempts only; a successful login resets the counter.
 */
@Component
public class LoginAttemptGuard {

    private static final String KEY_PREFIX = "login:throttle:";

    private final StringRedisTemplate redis;
    private final int maxAttempts;
    private final Duration window;

    public LoginAttemptGuard(StringRedisTemplate redis,
                             @Value("${app.login-throttle.max-attempts:10}") int maxAttempts,
                             @Value("${app.login-throttle.window-minutes:15}") long windowMinutes) {
        this.redis = redis;
        this.maxAttempts = maxAttempts;
        this.window = Duration.ofMinutes(windowMinutes);
    }

    /** True once this (scope, identifier, IP) has reached the failed-attempt budget for the window. */
    public boolean isBlocked(String scope, String identifier, String clientIp) {
        String value = redis.opsForValue().get(key(scope, identifier, clientIp));
        return value != null && Integer.parseInt(value) >= maxAttempts;
    }

    /** Record one failed attempt, setting the window TTL on the first failure. */
    public void recordFailure(String scope, String identifier, String clientIp) {
        String key = key(scope, identifier, clientIp);
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redis.expire(key, window);
        }
    }

    /** Clear the counter — called on a successful login. */
    public void reset(String scope, String identifier, String clientIp) {
        redis.delete(key(scope, identifier, clientIp));
    }

    private String key(String scope, String identifier, String clientIp) {
        return KEY_PREFIX + scope + ":" + identifier + ":" + clientIp;
    }
}
