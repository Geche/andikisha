package com.andikisha.document.infrastructure.grpc;

import com.andikisha.proto.tenant.GetTenantRequest;
import com.andikisha.proto.tenant.TenantResponse;
import com.andikisha.proto.tenant.TenantServiceGrpc;
import io.grpc.Channel;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Reads tenant profile (notably the registered employer name) from tenant-service. Used by the
 * Certificate of Service generator to name the employer per Employment Act §52(1) (#45 slice 1).
 */
@Component
public class TenantGrpcClient {

    private final TenantServiceGrpc.TenantServiceBlockingStub stub;
    private final int deadlineSeconds;

    public TenantGrpcClient(
            @GrpcClient("tenant-service") Channel channel,
            @Value("${app.grpc.tenant.deadline-seconds:10}") int deadlineSeconds) {
        this.stub = TenantServiceGrpc.newBlockingStub(channel);
        this.deadlineSeconds = deadlineSeconds;
    }

    public TenantResponse getTenant(String tenantId) {
        return stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                .getTenant(GetTenantRequest.newBuilder()
                        .setTenantId(tenantId)
                        .build());
    }
}
