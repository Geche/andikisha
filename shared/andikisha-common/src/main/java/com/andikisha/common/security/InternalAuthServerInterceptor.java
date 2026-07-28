package com.andikisha.common.security;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Verifies the internal attestation on every inbound gRPC call before the handler runs (audit M2),
 * so a service serves cross-tenant data over gRPC only to callers that hold
 * {@code INTERNAL_SIGNING_SECRET}. Mode mirrors the REST filter:
 * <ul>
 *   <li>no secret configured — verification off;</li>
 *   <li>{@code log} (default) — verify and WARN on failure but still serve (safe rollout);</li>
 *   <li>{@code enforce} — reject with {@code UNAUTHENTICATED} when the attestation is missing/invalid.</li>
 * </ul>
 */
public class InternalAuthServerInterceptor implements ServerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(InternalAuthServerInterceptor.class);

    private final InternalAuthToken token; // null when no secret is configured
    private final boolean enforce;

    public InternalAuthServerInterceptor(String secret, String mode) {
        this.token = (secret != null && secret.length() >= 16)
                ? new InternalAuthToken(secret.getBytes(StandardCharsets.UTF_8), InternalAuthGrpc.SKEW_SECONDS)
                : null;
        this.enforce = "enforce".equalsIgnoreCase(mode == null ? "" : mode.trim());
    }

    @Override
    public <Q, S> ServerCall.Listener<Q> interceptCall(ServerCall<Q, S> call, Metadata headers,
                                                       ServerCallHandler<Q, S> next) {
        if (token != null) {
            String method = call.getMethodDescriptor().getFullMethodName();
            String attestation = headers.get(InternalAuthGrpc.ATTESTATION);
            if (!token.verify(attestation, Instant.now().getEpochSecond(), method)) {
                log.warn("gRPC X-Internal-Auth verification FAILED (enforce={}) method={} attestation={}",
                        enforce, method, attestation == null ? "absent" : "present-invalid");
                if (enforce) {
                    call.close(Status.UNAUTHENTICATED.withDescription(
                            "Missing or invalid internal authentication"), new Metadata());
                    return new ServerCall.Listener<Q>() { };
                }
            }
        }
        return next.startCall(call, headers);
    }
}
