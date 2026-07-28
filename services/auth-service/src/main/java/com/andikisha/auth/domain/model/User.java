package com.andikisha.auth.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    // Account-lockout backoff (audit M6): short, escalating windows instead of a flat 30-min hard
    // lock. 5th failure locks ~30s; each further failure doubles up to a 5-min cap; a successful
    // login resets the counter. Keeps the DoS window low while the edge rate limit caps brute-force
    // volume. See docs/decisions/2026-07-28-login-rate-limit-redesign.md.
    private static final int LOCK_THRESHOLD = 5;
    private static final long BASE_LOCK_SECONDS = 30;
    private static final long MAX_LOCK_SECONDS = 300;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(name = "employee_id")
    private UUID employeeId;

    // AUTH-006: optional human name. NULL = no name set (callers fall back to email);
    // never store the email here. Source of truth is the employee record.
    @Column(name = "display_name", length = 200)
    private String displayName;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "must_change_password", nullable = false)
    private boolean mustChangePassword = true;

    protected User() {}

    public static User create(String tenantId, String email, String phoneNumber,
                              String passwordHash, Role role) {
        User user = new User();
        user.setTenantId(tenantId);
        user.email = email.toLowerCase().trim();
        user.phoneNumber = phoneNumber;
        user.passwordHash = passwordHash;
        user.role = role;
        user.active = true;
        user.failedLoginAttempts = 0;
        user.mustChangePassword = true;
        return user;
    }

    public void recordSuccessfulLogin() {
        this.lastLogin = LocalDateTime.now();
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    public void recordFailedLogin() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= LOCK_THRESHOLD) {
            int steps = Math.min(this.failedLoginAttempts - LOCK_THRESHOLD, 20); // guard shift overflow
            long lockSeconds = Math.min(BASE_LOCK_SECONDS << steps, MAX_LOCK_SECONDS);
            this.lockedUntil = LocalDateTime.now().plusSeconds(lockSeconds);
        }
    }

    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    public void clearLockIfExpired() {
        if (lockedUntil != null && LocalDateTime.now().isAfter(lockedUntil)) {
            this.lockedUntil = null;
            // Keep failedLoginAttempts so repeated lock cycles escalate the backoff (audit M6).
            // Only a successful login resets the counter (recordSuccessfulLogin).
        }
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    public void changePassword(String newPasswordHash) {
        if (newPasswordHash == null || newPasswordHash.isBlank()) {
            throw new BusinessRuleException("Password cannot be empty");
        }
        this.passwordHash = newPasswordHash;
    }

    public void changeRole(Role newRole) {
        this.role = newRole;
    }

    public void linkEmployee(UUID employeeId) {
        if (this.role == Role.SUPER_ADMIN) {
            throw new com.andikisha.common.exception.BusinessRuleException(
                    "SUPER_ADMIN users must not be linked to an employee record.");
        }
        this.employeeId = employeeId;
    }

    public void setDisplayName(String displayName) {
        // Normalise blank to null so "no name" stays distinct from email at read time.
        this.displayName = (displayName == null || displayName.isBlank()) ? null : displayName.trim();
    }

    public void clearMustChangePassword() {
        this.mustChangePassword = false;
    }

    public void setMustChangePassword(boolean value) {
        this.mustChangePassword = value;
    }

}