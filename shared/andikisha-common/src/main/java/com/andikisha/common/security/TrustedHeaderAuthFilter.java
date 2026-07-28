package com.andikisha.common.security;

import com.andikisha.common.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Establishes the request's identity (tenant, user, role, employee) from the headers the API gateway
 * injects after it authenticates the JWT. Shared by every domain service — services scan
 * {@code com.andikisha.common}, so this single {@code @Component} replaces the 12 copy-pasted
 * per-service copies the audit flagged.
 *
 * <p><b>Trust-boundary verification (audit M1/M2).</b> Before trusting the identity headers, the
 * filter verifies the gateway's {@code X-Internal-Auth} attestation over those exact values, so
 * {@code X-User-Role: ADMIN} (and the tenant) are honoured only when they provably came from the
 * gateway. {@code INTERNAL_AUTH_MODE} controls behaviour:
 * <ul>
 *   <li>{@code off} — no verification (e.g. before a secret is configured);</li>
 *   <li>{@code log} — verify and WARN on failure but still serve (safe rollout — the default);</li>
 *   <li>{@code enforce} — reject with 401 when the attestation is missing or invalid.</li>
 * </ul>
 * With no {@code INTERNAL_SIGNING_SECRET} configured the filter cannot verify and behaves as
 * {@code off}. Verification runs only when identity headers are present (i.e. when there is an
 * identity to trust).
 */
@Component
public class TrustedHeaderAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TrustedHeaderAuthFilter.class);
    private static final long SKEW_SECONDS = 30;

    private final InternalAuthToken internalAuth; // null when no secret is configured
    private final Mode mode;

    private enum Mode { OFF, LOG, ENFORCE }

    public TrustedHeaderAuthFilter(
            @Value("${INTERNAL_SIGNING_SECRET:}") String secret,
            @Value("${INTERNAL_AUTH_MODE:log}") String mode) {
        this.internalAuth = (secret != null && secret.length() >= 16)
                ? new InternalAuthToken(secret.getBytes(StandardCharsets.UTF_8), SKEW_SECONDS)
                : null;
        this.mode = parseMode(mode);
    }

    private static Mode parseMode(String mode) {
        try {
            return Mode.valueOf(mode.trim().toUpperCase());
        } catch (RuntimeException e) {
            return Mode.LOG;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String rawUserId     = request.getHeader("X-User-ID");
        String rawRole       = request.getHeader("X-User-Role");
        String rawTenantId   = request.getHeader("X-Tenant-ID");
        String rawEmail      = request.getHeader("X-User-Email");
        String rawEmployeeId = request.getHeader("X-Employee-ID");
        String requestId     = UUID.randomUUID().toString().substring(0, 8);

        try {
            if (rawUserId != null && !rawUserId.isBlank() && rawRole != null && !rawRole.isBlank()) {

                // Trust boundary (audit M1/M2): verify the gateway attestation over the RAW header
                // values (the exact strings the gateway signed) before establishing identity.
                if (!verifyGatewayAttestation(request, rawUserId, rawTenantId, rawRole, rawEmail, rawEmployeeId)
                        && mode == Mode.ENFORCE) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                            "Missing or invalid internal authentication");
                    return;
                }

                String userId     = sanitise(rawUserId);
                String role       = sanitise(rawRole);
                String tenantId   = rawTenantId != null ? sanitise(rawTenantId) : null;
                String employeeId = rawEmployeeId != null && !rawEmployeeId.isBlank()
                        ? sanitise(rawEmployeeId) : null;

                // principal = userId (stable for all roles); credentials = employeeId when present,
                // so service-layer ownership checks compare against the employee identity
                // (SEC-BACKLOG-001), not the user UUID.
                var auth = new UsernamePasswordAuthenticationToken(
                        userId, employeeId,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                SecurityContextHolder.getContext().setAuthentication(auth);
                MDC.put("userId", userId);

                if (tenantId != null) {
                    TenantContext.setTenantId(tenantId);
                    MDC.put("tenantId", tenantId);
                }
            }
            MDC.put("requestId", requestId);
            response.setHeader("X-Request-ID", requestId);
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
            TenantContext.clear();
            MDC.remove("tenantId");
            MDC.remove("requestId");
            MDC.remove("userId");
        }
    }

    private boolean verifyGatewayAttestation(HttpServletRequest request, String userId, String tenantId,
                                             String role, String email, String employeeId) {
        if (internalAuth == null || mode == Mode.OFF) {
            return true; // not configured to verify
        }
        String attestation = request.getHeader("X-Internal-Auth");
        boolean ok = internalAuth.verify(attestation, Instant.now().getEpochSecond(),
                nz(userId), nz(tenantId), nz(role), nz(email), nz(employeeId));
        if (!ok) {
            log.warn("X-Internal-Auth verification FAILED (mode={}) path={} attestation={}",
                    mode, request.getRequestURI(), attestation == null ? "absent" : "present-invalid");
        }
        return ok;
    }

    private static String sanitise(String value) {
        return value.replaceAll("[\r\n\t]", "_");
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
