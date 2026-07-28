package com.andikisha.analytics.infrastructure.config;

import com.andikisha.common.security.InternalAuthClientInterceptor;
import io.grpc.ClientInterceptor;
import net.devh.boot.grpc.client.interceptor.GrpcGlobalClientInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Attaches the internal-auth attestation to outbound gRPC calls (audit M2). analytics-service uses
 * the gRPC client starter only, so no server interceptor here. No-op until the secret is set.
 */
@Configuration
public class GrpcInternalAuthConfig {

    @Bean
    @GrpcGlobalClientInterceptor
    ClientInterceptor internalAuthClientInterceptor(
            @Value("${INTERNAL_SIGNING_SECRET:}") String secret) {
        return new InternalAuthClientInterceptor(secret);
    }
}
