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
        "/api/v1/auth/super-admin/provision",
        "/api/v1/auth/super-admin/login",
        "/api/v1/auth/ussd/validate",
        "/api/v1/plans"
    );

    /** Path prefixes requiring no JWT and no tenant header. */
    public static final List<String> PREFIXES = List.of(
        "/api/v1/callbacks/",
        "/actuator/health",
        "/actuator/info",
        "/swagger-ui",
        "/v3/api-docs",
        "/webjars/",
        "/services/"
    );
}
