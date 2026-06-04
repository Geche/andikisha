package com.andikisha.auth.domain.exception;

import java.util.UUID;

/**
 * Thrown when an activation attempt targets an employee who already has a user account.
 * Carries the employeeId so the frontend can build a deep-link to the password-reset action.
 */
public class UserAlreadyActivatedException extends RuntimeException {

    private final UUID employeeId;

    public UserAlreadyActivatedException(UUID employeeId) {
        super("This employee already has an active user account. " +
              "To reset their password, use the admin password reset action on their profile.");
        this.employeeId = employeeId;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }
}
