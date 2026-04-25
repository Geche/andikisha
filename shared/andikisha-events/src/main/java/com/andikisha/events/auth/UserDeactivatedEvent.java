package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class UserDeactivatedEvent extends BaseEvent {

    private String userId;

    public UserDeactivatedEvent(String tenantId, String userId) {
        super("auth.user_deactivated", tenantId);
        this.userId = userId;
    }

    protected UserDeactivatedEvent() { super(); }

    public String getUserId() { return userId; }
}