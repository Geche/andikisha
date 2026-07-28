package com.andikisha.auth.presentation.support;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Best-effort client IP resolution for the login brute-force throttle (audit M5/M6).
 *
 * <p>The gateway appends the real client to {@code X-Forwarded-For}, so the first hop is the
 * original client; fall back to the socket address. This is NOT a security boundary on its own —
 * {@code X-Forwarded-For} is client-influenced. The gateway's per-socket-IP rate limit is the
 * non-spoofable layer; this value only scopes the per-account failed-attempt throttle so that
 * throttling one attacker source does not lock a legitimate user on a different IP.
 */
public final class ClientIp {

    private ClientIp() {}

    public static String resolve(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote != null ? remote : "unknown";
    }
}
