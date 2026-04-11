package com.andikisha.payroll.presentation.filter;

import com.andikisha.common.tenant.TenantContext;
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
 * Populates TenantContext and MDC from the X-Tenant-ID request header for every
 * inbound request, and clears both in the finally block so servlet-thread-pool
 * threads are never left holding a stale tenant identity.
 */
@Component
@Order(1)
public class TenantContextFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String MDC_TENANT    = "tenantId";
    private static final String MDC_REQUEST   = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String tenantId  = request.getHeader(TENANT_HEADER);
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        try {
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
                MDC.put(MDC_TENANT, tenantId);
            }
            MDC.put(MDC_REQUEST, requestId);
            response.setHeader("X-Request-ID", requestId);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            MDC.remove(MDC_TENANT);
            MDC.remove(MDC_REQUEST);
        }
    }
}
