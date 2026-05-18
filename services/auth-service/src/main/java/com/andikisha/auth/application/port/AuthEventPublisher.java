package com.andikisha.auth.application.port;

import com.andikisha.auth.domain.model.User;

public interface AuthEventPublisher {

    void publishUserRegistered(User user);

    void publishUserDeactivated(String tenantId, String userId);

    void publishEmployeeUserProvisioned(String tenantId, String employeeId,
                                        String email, String firstName, String lastName,
                                        String employeeNumber, String tempPassword);

    void publishPasswordResetRequested(String tenantId, String email, String resetToken);
}