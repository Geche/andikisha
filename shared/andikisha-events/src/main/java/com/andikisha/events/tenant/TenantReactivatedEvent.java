package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantReactivatedEvent extends BaseEvent {

    public TenantReactivatedEvent(String tenantId) {
        super("tenant.reactivated", tenantId);
    }

    protected TenantReactivatedEvent() { super(); }
}
