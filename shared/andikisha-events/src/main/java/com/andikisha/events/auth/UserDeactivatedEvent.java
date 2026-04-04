package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class UserDeactivatedEvent extends BaseEvent {

    private final String userId;

    public UserDeactivatedEvent(String tenantId, String userId) {
        super("auth.user_deactivated", tenantId);
        this.userId = userId;
    }

    protected UserDeactivatedEvent() { super(); this.userId = null; }

    public String getUserId() { return userId; }
}