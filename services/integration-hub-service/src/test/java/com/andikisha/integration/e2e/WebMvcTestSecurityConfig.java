package com.andikisha.integration.e2e;

import com.andikisha.integration.presentation.filter.MpesaSourceIpFilter;
import com.andikisha.integration.presentation.filter.TrustedHeaderAuthFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.util.List;

/**
 * Test configuration for {@code @WebMvcTest} slices.
 * Provides pass-through implementations of filters that depend on beans
 * not loaded in the web-layer slice (TenantContext, Redis, etc.).
 */
@TestConfiguration
public class WebMvcTestSecurityConfig {

    @Bean
    @Primary
    public TrustedHeaderAuthFilter trustedHeaderAuthFilter() {
        return new TrustedHeaderAuthFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {
                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    @Primary
    public MpesaSourceIpFilter mpesaSourceIpFilter() {
        // Disabled in all @WebMvcTest slices — IP validation is covered by MpesaSourceIpFilterTest
        return new MpesaSourceIpFilter(List.of(), true);
    }
}
