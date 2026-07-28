package com.andikisha.auth.unit;

import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Account-lockout model (audit M6). The old flat 30-minute hard lock let anyone who knew an email
 * DoS the account (5 wrong passwords → locked 30 min). The model now uses short, escalating backoff
 * so the common case (a user mistyping) recovers in ~30s, the DoS window is capped low, and repeated
 * lock cycles escalate — while the edge rate limit (Traefik) caps rapid brute-force volume.
 */
class UserTest {

    private User newUser() {
        return User.create("t1", "jane@test.com", "+254700000001", "hash", Role.EMPLOYEE);
    }

    private long secondsUntilLock(User u) {
        return Duration.between(LocalDateTime.now(), u.getLockedUntil()).getSeconds();
    }

    @Test
    void belowThreshold_isNotLocked() {
        User u = newUser();
        for (int i = 0; i < 4; i++) u.recordFailedLogin();
        assertThat(u.isLocked()).isFalse();
    }

    @Test
    void atThreshold_locksForShortBaseWindow_notThirtyMinutes() {
        User u = newUser();
        for (int i = 0; i < 5; i++) u.recordFailedLogin();
        assertThat(u.isLocked()).isTrue();
        assertThat(secondsUntilLock(u)).isBetween(20L, 40L); // ~30s base, never 30 min
    }

    @Test
    void repeatedFailures_escalateTheBackoff() {
        User u = newUser();
        for (int i = 0; i < 5; i++) u.recordFailedLogin();
        long first = secondsUntilLock(u);
        u.recordFailedLogin(); // 6th
        long second = secondsUntilLock(u);
        assertThat(second).isGreaterThan(first);
    }

    @Test
    void escalationIsCappedLow() {
        User u = newUser();
        for (int i = 0; i < 20; i++) u.recordFailedLogin();
        assertThat(secondsUntilLock(u)).isLessThanOrEqualTo(310L); // capped at 5 min (+tolerance)
    }

    @Test
    void clearLockIfExpired_clearsLockButKeepsAttemptCount_soBackoffKeepsEscalating() {
        User u = newUser();
        for (int i = 0; i < 6; i++) u.recordFailedLogin(); // attempts = 6
        // Force the current lock to have expired.
        ReflectionTestUtils.setField(u, "lockedUntil", LocalDateTime.now().minusSeconds(1));

        u.clearLockIfExpired();

        assertThat(u.isLocked()).isFalse();
        assertThat(u.getFailedLoginAttempts()).isEqualTo(6); // NOT reset — escalation persists
    }

    @Test
    void successfulLogin_resetsAttemptsSoNextLockStartsAtBase() {
        User u = newUser();
        for (int i = 0; i < 8; i++) u.recordFailedLogin();
        u.recordSuccessfulLogin();
        assertThat(u.isLocked()).isFalse();
        assertThat(u.getFailedLoginAttempts()).isZero();

        for (int i = 0; i < 5; i++) u.recordFailedLogin();
        assertThat(secondsUntilLock(u)).isBetween(20L, 40L); // back to base window
    }
}
