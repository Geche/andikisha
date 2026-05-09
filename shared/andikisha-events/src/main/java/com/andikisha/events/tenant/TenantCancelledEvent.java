package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantCancelledEvent extends BaseEvent {

    private String cancelledBy;

    public TenantCancelledEvent(String tenantId, String cancelledBy) {
        super("tenant.cancelled", tenantId);
        this.cancelledBy = cancelledBy;
    }

    protected TenantCancelledEvent() { super(); }

    public String getCancelledBy() { return cancelledBy; }
}
