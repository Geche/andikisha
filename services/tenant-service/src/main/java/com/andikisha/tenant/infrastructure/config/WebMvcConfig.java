package com.andikisha.tenant.infrastructure.config;

import com.andikisha.common.tenant.TenantInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Bean
    public TenantInterceptor tenantInterceptor() {
        return new TenantInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor())
                .addPathPatterns("/api/**")
                // Tenant CRUD uses explicit tenantId path params, not TenantContext
                .excludePathPatterns("/api/v1/tenants", "/api/v1/tenants/**")
                // Plan listing is public (needed during signup before a tenant exists)
                .excludePathPatterns("/api/v1/plans", "/api/v1/plans/**")
                // SUPER_ADMIN endpoints operate platform-wide, not per-tenant.
                // Both prefixes are excluded: legacy "/super-admin" (hyphenated,
                // existing controller) and the cross-service "/superadmin" used
                // by auth-service and the dashboard endpoints.
                .excludePathPatterns("/api/v1/super-admin", "/api/v1/super-admin/**")
                .excludePathPatterns("/api/v1/superadmin", "/api/v1/superadmin/**");
    }
}
