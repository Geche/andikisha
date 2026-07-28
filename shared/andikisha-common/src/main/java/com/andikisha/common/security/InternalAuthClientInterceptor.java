package com.andikisha.common.security;

import io.grpc.CallOptions;
import io.grpc.Channel;
import io.grpc.ClientCall;
import io.grpc.ClientInterceptor;
import io.grpc.ForwardingClientCall;
import io.grpc.Metadata;
import io.grpc.MethodDescriptor;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Attaches the gateway-shared internal attestation to every outbound gRPC call (audit M2), proving
 * to the callee that the caller holds {@code INTERNAL_SIGNING_SECRET}. The attestation is bound to
 * the fully-qualified method name and the current time (short skew window), so a captured token
 * cannot be replayed against a different method or after the window. When no secret is configured
 * the interceptor is a no-op (safe rollout — the server verifies in log-only mode until enforced).
 */
public class InternalAuthClientInterceptor implements ClientInterceptor {

    private final InternalAuthToken token; // null when no secret is configured

    public InternalAuthClientInterceptor(String secret) {
        this.token = (secret != null && secret.length() >= 16)
                ? new InternalAuthToken(secret.getBytes(StandardCharsets.UTF_8), InternalAuthGrpc.SKEW_SECONDS)
                : null;
    }

    @Override
    public <Q, S> ClientCall<Q, S> interceptCall(MethodDescriptor<Q, S> method,
                                                 CallOptions options, Channel next) {
        ClientCall<Q, S> call = next.newCall(method, options);
        if (token == null) {
            return call;
        }
        return new ForwardingClientCall.SimpleForwardingClientCall<Q, S>(call) {
            @Override
            public void start(Listener<S> responseListener, Metadata headers) {
                headers.put(InternalAuthGrpc.ATTESTATION,
                        token.sign(Instant.now().getEpochSecond(), method.getFullMethodName()));
                super.start(responseListener, headers);
            }
        };
    }
}
