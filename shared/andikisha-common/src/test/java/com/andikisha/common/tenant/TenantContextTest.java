package com.andikisha.common.tenant;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantContextTest {

    @AfterEach
    void clearContext() {
        TenantContext.clear();
    }

    @Test
    void setAndGet_returnsCorrectTenantId() {
        TenantContext.setTenantId("tenant-abc");
        assertThat(TenantContext.getTenantId()).isEqualTo("tenant-abc");
    }

    @Test
    void clear_removesTenantId() {
        TenantContext.setTenantId("tenant-abc");
        TenantContext.clear();
        assertThat(TenantContext.getTenantId()).isNull();
    }

    @Test
    void requireTenantId_throwsWhenNotSet() {
        assertThatThrownBy(TenantContext::requireTenantId)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void tenantId_does_not_propagate_to_child_thread() throws Exception {
        // ThreadLocal (not InheritableThreadLocal) — child threads must set tenant explicitly.
        // Entry points (gRPC interceptors, filters, RabbitMQ listeners) all call setTenantId
        // themselves, so inheritance from a parent thread provides no value and risks stale state.
        TenantContext.setTenantId("tenant-abc");
        var ref = new AtomicReference<String>();
        var thread = new Thread(() -> ref.set(TenantContext.getTenantId()));
        thread.start();
        thread.join(1000);
        assertThat(ref.get()).isNull();
    }
}
