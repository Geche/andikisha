package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantSuspendedEvent extends BaseEvent {

    private String reason;

    public TenantSuspendedEvent(String tenantId, String reason) {
        super("tenant.suspended", tenantId);
        this.reason = reason;
    }

    protected TenantSuspendedEvent() { super(); }

    public String getReason() { return reason; }
}