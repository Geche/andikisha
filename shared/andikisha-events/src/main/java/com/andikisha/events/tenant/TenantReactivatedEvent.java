package com.andikisha.events.tenant;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.events.BaseEvent;

public class TenantReactivatedEvent extends BaseEvent {

    private String reactivatedBy;
    private String previousStatus;

    public TenantReactivatedEvent(String tenantId, String reactivatedBy,
                                  LicenceStatus previousStatus) {
        super("tenant.reactivated", tenantId);
        this.reactivatedBy = reactivatedBy;
        this.previousStatus = previousStatus != null ? previousStatus.name() : null;
    }

    protected TenantReactivatedEvent() { super(); }

    public String getReactivatedBy() { return reactivatedBy; }
    public String getPreviousStatus() { return previousStatus; }
}
