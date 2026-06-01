package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class AdminPasswordResetEvent extends BaseEvent {

    private String performedBy;
    private String targetUserId;

    public AdminPasswordResetEvent(String tenantId, String performedBy, String targetUserId) {
        super("auth.admin_password_reset", tenantId);
        this.performedBy  = performedBy;
        this.targetUserId = targetUserId;
    }

    protected AdminPasswordResetEvent() { super(); }

    public String getPerformedBy()  { return performedBy; }
    public String getTargetUserId() { return targetUserId; }
}
