package com.andikisha.auth.application.port;

import com.andikisha.auth.domain.model.User;

public interface AuthEventPublisher {

    void publishUserRegistered(User user);

    void publishUserDeactivated(String tenantId, String userId);
}