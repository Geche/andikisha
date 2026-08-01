package com.andikisha.employee.application.dto.response;

/**
 * Result of admin employee self-setup (AUTH-BACKLOG-001). Returns the new employee id so the client
 * can confirm the auth-user link by value (polling {@code /api/auth/me}) rather than by presence.
 */
public record SelfSetupResponse(
        String employeeId,
        String employeeNumber,
        boolean pendingActivation
) {}
