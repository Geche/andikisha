package com.andikisha.employee.presentation.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Enriches the MDC context for every inbound request with tenantId and a short
 * request ID so that log lines emitted by any downstream component are
 * automatically correlated to the tenant and request.
 */
@Component
@Order(1)
public class TenantLoggingFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String MDC_TENANT    = "tenantId";
    private static final String MDC_REQUEST   = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String rawTenantId = request.getHeader(TENANT_HEADER);
        // Sanitize to prevent log injection (CRLF in header value)
        String tenantId  = rawTenantId != null ? rawTenantId.replaceAll("[\r\n\t]", "_") : null;
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        try {
            if (tenantId != null) MDC.put(MDC_TENANT, tenantId);
            MDC.put(MDC_REQUEST, requestId);
            response.setHeader("X-Request-ID", requestId);
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_TENANT);
            MDC.remove(MDC_REQUEST);
        }
    }
}
