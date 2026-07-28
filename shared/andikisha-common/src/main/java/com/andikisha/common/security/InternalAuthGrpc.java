package com.andikisha.common.security;

import io.grpc.Metadata;

/**
 * Shared constants for gRPC internal-auth attestation (audit M2). The gRPC plane had no
 * authentication — any workload that could open a channel read/wrote any tenant's data. The client
 * interceptor signs an {@code x-internal-auth} metadata entry proving the caller holds the shared
 * {@code INTERNAL_SIGNING_SECRET}, bound to the invoked method to scope replay; the server
 * interceptor verifies it before the handler runs.
 */
final class InternalAuthGrpc {

    private InternalAuthGrpc() {}

    static final Metadata.Key<String> ATTESTATION =
            Metadata.Key.of("x-internal-auth", Metadata.ASCII_STRING_MARSHALLER);

    static final long SKEW_SECONDS = 30;
}
