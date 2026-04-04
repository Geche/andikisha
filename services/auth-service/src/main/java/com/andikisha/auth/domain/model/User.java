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

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

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
        return user;
    }

    public void recordSuccessfulLogin() {
        this.lastLogin = LocalDateTime.now();
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    public void recordFailedLogin() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    public boolean isLocked() {
        if (lockedUntil == null) return false;
        if (LocalDateTime.now().isAfter(lockedUntil)) {
            this.lockedUntil = null;
            this.failedLoginAttempts = 0;
            return false;
        }
        return true;
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
        this.employeeId = employeeId;
    }

}