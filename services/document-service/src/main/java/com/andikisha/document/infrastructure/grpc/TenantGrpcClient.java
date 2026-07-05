package com.andikisha.document.infrastructure.grpc;

import com.andikisha.proto.tenant.GetTenantLogoRequest;
import com.andikisha.proto.tenant.GetTenantRequest;
import com.andikisha.proto.tenant.GetTenantSignatoryRequest;
import com.andikisha.proto.tenant.TenantLogoResponse;
import com.andikisha.proto.tenant.TenantResponse;
import com.andikisha.proto.tenant.TenantServiceGrpc;
import com.andikisha.proto.tenant.TenantSignatoryResponse;
import io.grpc.Channel;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Reads tenant profile (employer name §51(2), company logo) from tenant-service for the
 * Certificate of Service (#45).
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

    public TenantLogoResponse getTenantLogo(String tenantId) {
        return stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                .getTenantLogo(GetTenantLogoRequest.newBuilder()
                        .setTenantId(tenantId)
                        .build());
    }

    public TenantSignatoryResponse getTenantSignatory(String tenantId) {
        return stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                .getTenantSignatory(GetTenantSignatoryRequest.newBuilder()
                        .setTenantId(tenantId)
                        .build());
    }
}
