package com.andikisha.gateway.config;

import com.andikisha.common.security.InternalAuthClientInterceptor;
import io.grpc.ClientInterceptor;
import net.devh.boot.grpc.client.interceptor.GrpcGlobalClientInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Attaches the internal-auth attestation to the gateway's outbound gRPC calls (the licence
 * read-through to tenant-service) so tenant-service can verify the caller (audit M2). The gateway is
 * a gRPC client only, so no server interceptor here. No-op until INTERNAL_SIGNING_SECRET is set.
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
