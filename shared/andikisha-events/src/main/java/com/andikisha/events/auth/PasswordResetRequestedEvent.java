package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;

public class PasswordResetRequestedEvent extends BaseEvent {

    private String email;
    private String resetToken;

    public PasswordResetRequestedEvent(String tenantId, String email, String resetToken) {
        super("auth.password_reset_requested", tenantId);
        this.email = email;
        this.resetToken = resetToken;
    }

    protected PasswordResetRequestedEvent() { super(); }

    public String getEmail()      { return email; }
    public String getResetToken() { return resetToken; }
}
