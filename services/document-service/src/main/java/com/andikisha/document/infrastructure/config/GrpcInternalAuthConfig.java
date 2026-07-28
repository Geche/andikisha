package com.andikisha.document.infrastructure.config;

import com.andikisha.common.security.InternalAuthClientInterceptor;
import com.andikisha.common.security.InternalAuthServerInterceptor;
import io.grpc.ClientInterceptor;
import io.grpc.ServerInterceptor;
import net.devh.boot.grpc.client.interceptor.GrpcGlobalClientInterceptor;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers the internal-auth gRPC interceptors (audit M2): the server interceptor verifies inbound
 * calls carry a valid X-Internal-Auth attestation; the client interceptor attaches one to outbound
 * calls. Verification is log-only until INTERNAL_AUTH_MODE=enforce. The logic is shared in
 * andikisha-common; this wires it to net.devh (which lives in the service).
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

    @Bean
    @GrpcGlobalClientInterceptor
    ClientInterceptor internalAuthClientInterceptor(
            @Value("${INTERNAL_SIGNING_SECRET:}") String secret) {
        return new InternalAuthClientInterceptor(secret);
    }
}
