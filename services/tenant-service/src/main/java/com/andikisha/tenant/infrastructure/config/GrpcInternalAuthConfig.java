package com.andikisha.tenant.infrastructure.config;

import com.andikisha.common.security.InternalAuthServerInterceptor;
import io.grpc.ServerInterceptor;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Verifies the internal-auth attestation on inbound gRPC calls (audit M2). tenant-service uses the
 * gRPC server starter only, so no client interceptor here. Log-only until INTERNAL_AUTH_MODE=enforce.
 */
@Configuration
public class GrpcInternalAuthConfig {

    @Bean
    @GrpcGlobalServerInterceptor
    ServerInterceptor internalAuthServerInterceptor(
            @Value("${INTERNAL_SIGNING_SECRET:}") String secret,
            @Value("${INTERNAL_AUTH_MODE:log}") String mode) {
        return new InternalAuthServerInterceptor(secret, mode);
    }
}
