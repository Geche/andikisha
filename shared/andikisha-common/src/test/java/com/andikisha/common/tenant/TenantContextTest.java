package com.andikisha.common.tenant;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class TenantContextTest {

    @AfterEach
    void clearContext() {
        TenantContext.clear();
    }

    @Test
    void tenantId_propagates_to_child_thread() throws Exception {
        TenantContext.setTenantId("tenant-abc");
        var ref = new AtomicReference<String>();
        var thread = new Thread(() -> ref.set(TenantContext.getTenantId()));
        thread.start();
        thread.join(1000);
        assertThat(ref.get()).isEqualTo("tenant-abc");
        TenantContext.clear();
    }
}
