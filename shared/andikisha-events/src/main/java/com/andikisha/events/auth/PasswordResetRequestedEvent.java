package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;
import lombok.Getter;

@Getter
public class PasswordResetRequestedEvent extends BaseEvent {

    private String email;
    private String resetToken;

    protected PasswordResetRequestedEvent() {}

    public PasswordResetRequestedEvent(String tenantId, String email, String resetToken) {
        super("PasswordResetRequested", tenantId);
        this.email = email;
        this.resetToken = resetToken;
    }
}
