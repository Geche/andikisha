package com.andikisha.employee.presentation.filter;

import com.andikisha.common.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@Order(1)
public class TrustedHeaderAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String rawUserId   = request.getHeader("X-User-ID");
        String rawRole     = request.getHeader("X-User-Role");
        String rawTenantId = request.getHeader("X-Tenant-ID");
        String requestId   = UUID.randomUUID().toString().substring(0, 8);

        try {
            if (rawUserId != null && !rawUserId.isBlank() && rawRole != null && !rawRole.isBlank()) {
                String userId   = rawUserId.replaceAll("[\r\n\t]", "_");
                String role     = rawRole.replaceAll("[\r\n\t]", "_");
                String tenantId = rawTenantId != null ? rawTenantId.replaceAll("[\r\n\t]", "_") : null;

                var auth = new UsernamePasswordAuthenticationToken(
                        userId, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);

                if (tenantId != null) {
                    TenantContext.setTenantId(tenantId);
                    MDC.put("tenantId", tenantId);
                }
            }
            MDC.put("requestId", requestId);
            response.setHeader("X-Request-ID", requestId);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            MDC.remove("tenantId");
            MDC.remove("requestId");
        }
    }
}
