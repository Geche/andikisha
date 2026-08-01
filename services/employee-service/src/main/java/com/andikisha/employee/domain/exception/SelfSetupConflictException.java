package com.andikisha.employee.domain.exception;

/**
 * A self-setup request cannot proceed because of a conflict — the caller already has a linked employee
 * record ({@code ALREADY_LINKED}) or an employee with their email already exists ({@code EMAIL_IN_USE}).
 * Carries a distinct code so the client can show the right copy for each. Maps to HTTP 409.
 */
public class SelfSetupConflictException extends RuntimeException {

    private final String code;

    public SelfSetupConflictException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
