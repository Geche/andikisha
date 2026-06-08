package com.andikisha.gateway.grpc;

import com.andikisha.proto.tenant.TenantServiceGrpc;
import com.andikisha.proto.tenant.ValidateLicenceRequest;
import com.andikisha.proto.tenant.ValidateLicenceResponse;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Synchronous read-through client to tenant-service's licence validation RPC.
 *
 * <p>The {@code TenantLicenceFilter} keeps a short-lived Redis cache of each
 * tenant's licence status. On a cache miss it calls {@link #fetchStatus(String)},
 * which both returns the authoritative status and (as a side effect inside
 * tenant-service) repopulates the Redis key for subsequent requests. This is the
 * read-through that closes the "cache miss → permanent 503" failure mode.
 *
 * <p>The call is blocking; callers must offload it to a bounded-elastic
 * scheduler so the reactive gateway event loop is never blocked.
 */
@Component
public class TenantLicenceClient {

    private static final long DEADLINE_MS = 2_000L;

    @GrpcClient("tenant-service")
    private TenantServiceGrpc.TenantServiceBlockingStub licenceStub;

    /**
     * Returns the tenant's current licence status name (e.g. {@code TRIAL},
     * {@code ACTIVE}, {@code GRACE_PERIOD}, {@code SUSPENDED}, {@code EXPIRED},
     * {@code CANCELLED}, or {@code NONE} when no active licence exists).
     *
     * @throws io.grpc.StatusRuntimeException if tenant-service is unreachable or
     *                                        the deadline is exceeded — the
     *                                        filter translates this into the
     *                                        read-open / write-closed policy.
     */
    public String fetchStatus(String tenantId) {
        ValidateLicenceResponse response = licenceStub
                .withDeadlineAfter(DEADLINE_MS, TimeUnit.MILLISECONDS)
                .validateTenantLicence(ValidateLicenceRequest.newBuilder()
                        .setTenantId(tenantId)
                        .build());
        return response.getLicenceStatus();
    }
}
