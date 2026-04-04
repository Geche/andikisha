package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class UserRegisteredEvent extends BaseEvent {

    private final String userId;
    private final String email;
    private final String role;

    public UserRegisteredEvent(String tenantId, String userId,
                               String email, String role) {
        super("auth.user_registered", tenantId);
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    protected UserRegisteredEvent() { super(); this.userId = null; this.email = null; this.role = null; }

    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}