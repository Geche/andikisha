package com.andikisha.common.tenant;

public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {}

    public static void setTenantId(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static String requireTenantId() {
        String tenantId = CURRENT_TENANT.get();
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalStateException("Tenant context is not set. "
                    + "Ensure TenantContext.setTenantId() is called before this operation.");
        }
        return tenantId;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}