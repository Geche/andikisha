package com.andikisha.gateway.config;

import java.util.List;
import java.util.Set;

public final class GatewayPublicPaths {

    private GatewayPublicPaths() {}

    /** Exact paths requiring no JWT and no tenant header. */
    public static final Set<String> EXACT = Set.of(
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/refresh",
        // Bootstrap endpoint — no JWT (no account exists yet to authenticate as). It is
        // additionally guarded as INTERNAL-ONLY by the super-admin-provision-internal-only
        // route (InternalOnlyFilter), so it is unreachable through the gateway despite being
        // listed here. Legitimate provisioning is a direct internal call to auth-service.
        // See SEC-BACKLOG-004.
        "/api/v1/auth/super-admin/provision",
        "/api/v1/auth/super-admin/login",
        "/api/v1/auth/ussd/validate",
        "/api/v1/plans",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password"
    );

    /** Path prefixes requiring no JWT and no tenant header. */
    public static final List<String> PREFIXES = List.of(
        "/api/v1/public/",
        "/api/v1/callbacks/",
        "/actuator/health",
        "/actuator/info",
        "/swagger-ui",
        "/v3/api-docs",
        "/webjars/",
        "/services/"
    );
}
