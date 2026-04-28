package com.andikisha.events.tenant;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.events.BaseEvent;

public class TenantSuspendedEvent extends BaseEvent {

    private String suspendedBy;
    private String reason;
    private String previousStatus;

    public TenantSuspendedEvent(String tenantId, String suspendedBy,
                                String reason, LicenceStatus previousStatus) {
        super("tenant.suspended", tenantId);
        this.suspendedBy = suspendedBy;
        this.reason = reason;
        this.previousStatus = previousStatus != null ? previousStatus.name() : null;
    }

    protected TenantSuspendedEvent() { super(); }

    public String getSuspendedBy() { return suspendedBy; }
    public String getReason() { return reason; }
    public String getPreviousStatus() { return previousStatus; }
}
