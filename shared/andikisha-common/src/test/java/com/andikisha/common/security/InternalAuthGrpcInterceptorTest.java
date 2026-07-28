package com.andikisha.common.security;

import io.grpc.CallOptions;
import io.grpc.Channel;
import io.grpc.ClientCall;
import io.grpc.Metadata;
import io.grpc.MethodDescriptor;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.Status;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InternalAuthGrpcInterceptorTest {

    private static final String SECRET = "grpc-internal-signing-secret-32bytes!!"; // gitleaks:allow — non-secret test fixture
    private static final String METHOD = "com.andikisha.Employee/GetEmployee";

    private final InternalAuthToken verifier =
            new InternalAuthToken(SECRET.getBytes(StandardCharsets.UTF_8), 30);

    // ── client interceptor ────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void clientInterceptor_addsAttestationBoundToMethod() {
        InternalAuthClientInterceptor interceptor = new InternalAuthClientInterceptor(SECRET);
        Channel channel = mock(Channel.class);
        ClientCall<byte[], byte[]> rawCall = mock(ClientCall.class);
        MethodDescriptor<byte[], byte[]> md = methodDescriptor(METHOD);
        when(channel.newCall(eq(md), any())).thenReturn(rawCall);

        ClientCall<byte[], byte[]> wrapped = interceptor.interceptCall(md, CallOptions.DEFAULT, channel);
        wrapped.start(mock(ClientCall.Listener.class), new Metadata());

        ArgumentCaptor<Metadata> headers = ArgumentCaptor.forClass(Metadata.class);
        verify(rawCall).start(any(), headers.capture());
        String attestation = headers.getValue().get(InternalAuthGrpc.ATTESTATION);
        assertThat(attestation).isNotNull();
        assertThat(verifier.verify(attestation, Instant.now().getEpochSecond(), METHOD)).isTrue();
        // not valid for a different method — bound to this call
        assertThat(verifier.verify(attestation, Instant.now().getEpochSecond(),
                "com.andikisha.Tenant/GetTenant")).isFalse();
    }

    @Test
    @SuppressWarnings("unchecked")
    void clientInterceptor_noSecret_addsNothing() {
        InternalAuthClientInterceptor interceptor = new InternalAuthClientInterceptor("");
        Channel channel = mock(Channel.class);
        ClientCall<byte[], byte[]> rawCall = mock(ClientCall.class);
        MethodDescriptor<byte[], byte[]> md = methodDescriptor(METHOD);
        when(channel.newCall(eq(md), any())).thenReturn(rawCall);

        interceptor.interceptCall(md, CallOptions.DEFAULT, channel)
                .start(mock(ClientCall.Listener.class), new Metadata());

        ArgumentCaptor<Metadata> headers = ArgumentCaptor.forClass(Metadata.class);
        verify(rawCall).start(any(), headers.capture());
        assertThat(headers.getValue().get(InternalAuthGrpc.ATTESTATION)).isNull();
    }

    // ── server interceptor ────────────────────────────────────────────────────

    @Test
    void serverInterceptor_validAttestation_proceeds() {
        InternalAuthServerInterceptor interceptor = new InternalAuthServerInterceptor(SECRET, "enforce");
        Metadata headers = new Metadata();
        headers.put(InternalAuthGrpc.ATTESTATION,
                verifier.sign(Instant.now().getEpochSecond(), METHOD));

        ServerCall<byte[], byte[]> call = serverCall(METHOD);
        ServerCallHandler<byte[], byte[]> handler = handler();

        interceptor.interceptCall(call, headers, handler);

        verify(handler).startCall(call, headers);
        verify(call, never()).close(any(), any());
    }

    @Test
    void serverInterceptor_invalidAttestation_enforce_rejectsUnauthenticated() {
        InternalAuthServerInterceptor interceptor = new InternalAuthServerInterceptor(SECRET, "enforce");
        Metadata headers = new Metadata(); // no attestation

        ServerCall<byte[], byte[]> call = serverCall(METHOD);
        ServerCallHandler<byte[], byte[]> handler = handler();

        interceptor.interceptCall(call, headers, handler);

        verify(call).close(argThat(s -> s.getCode() == Status.Code.UNAUTHENTICATED), any());
        verify(handler, never()).startCall(any(), any());
    }

    @Test
    void serverInterceptor_invalidAttestation_logMode_stillProceeds() {
        InternalAuthServerInterceptor interceptor = new InternalAuthServerInterceptor(SECRET, "log");
        Metadata headers = new Metadata(); // no attestation

        ServerCall<byte[], byte[]> call = serverCall(METHOD);
        ServerCallHandler<byte[], byte[]> handler = handler();

        interceptor.interceptCall(call, headers, handler);

        verify(handler).startCall(call, headers);
        verify(call, never()).close(any(), any());
    }

    @Test
    void serverInterceptor_noSecret_doesNotVerify() {
        InternalAuthServerInterceptor interceptor = new InternalAuthServerInterceptor("", "enforce");
        Metadata headers = new Metadata();

        ServerCall<byte[], byte[]> call = serverCall(METHOD);
        ServerCallHandler<byte[], byte[]> handler = handler();

        interceptor.interceptCall(call, headers, handler);

        verify(handler).startCall(call, headers);
        verify(call, never()).close(any(), any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private ServerCall<byte[], byte[]> serverCall(String method) {
        ServerCall<byte[], byte[]> call = mock(ServerCall.class);
        when(call.getMethodDescriptor()).thenReturn(methodDescriptor(method));
        return call;
    }

    @SuppressWarnings("unchecked")
    private ServerCallHandler<byte[], byte[]> handler() {
        return mock(ServerCallHandler.class);
    }

    private static MethodDescriptor<byte[], byte[]> methodDescriptor(String fullName) {
        return MethodDescriptor.<byte[], byte[]>newBuilder()
                .setType(MethodDescriptor.MethodType.UNARY)
                .setFullMethodName(fullName)
                .setRequestMarshaller(BYTES_MARSHALLER)
                .setResponseMarshaller(BYTES_MARSHALLER)
                .build();
    }

    private static final MethodDescriptor.Marshaller<byte[]> BYTES_MARSHALLER =
            new MethodDescriptor.Marshaller<>() {
                @Override
                public InputStream stream(byte[] value) {
                    return new ByteArrayInputStream(value);
                }

                @Override
                public byte[] parse(InputStream stream) {
                    return new byte[0];
                }
            };
}
