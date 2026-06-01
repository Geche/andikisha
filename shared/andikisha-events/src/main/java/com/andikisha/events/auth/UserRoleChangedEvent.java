package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class UserRoleChangedEvent extends BaseEvent {

    private String changerId;
    private String targetUserId;
    private String oldRole;
    private String newRole;

    public UserRoleChangedEvent(String tenantId, String changerId,
                                String targetUserId, String oldRole, String newRole) {
        super("auth.role_changed", tenantId);
        this.changerId    = changerId;
        this.targetUserId = targetUserId;
        this.oldRole      = oldRole;
        this.newRole      = newRole;
    }

    protected UserRoleChangedEvent() { super(); }

    public String getChangerId()    { return changerId; }
    public String getTargetUserId() { return targetUserId; }
    public String getOldRole()      { return oldRole; }
    public String getNewRole()      { return newRole; }
}
