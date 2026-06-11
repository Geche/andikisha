package com.andikisha.compliance.infrastructure.config;

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
                // Public statutory-rate endpoints are global (no tenant) and
                // anonymous — they carry no X-Tenant-ID, so skip the interceptor.
                .excludePathPatterns("/api/v1/public/**");
    }
}