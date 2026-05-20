package com.andikisha.auth.infrastructure.config;

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
        // tenantInterceptor() returns the Spring-managed bean via CGLIB proxy
        // Superadmin paths are SYSTEM-scoped and carry no X-Tenant-ID header
        registry.addInterceptor(tenantInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/v1/auth/super-admin/**",
                        "/api/v1/superadmin/**",
                        "/api/v1/auth/reset-password"
                );
    }
}
