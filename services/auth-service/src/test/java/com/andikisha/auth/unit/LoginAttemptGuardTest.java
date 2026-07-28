package com.andikisha.auth.unit;

import com.andikisha.auth.application.service.LoginAttemptGuard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginAttemptGuardTest {

    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> valueOps;

    private LoginAttemptGuard guard;
    private static final String KEY = "login:throttle:login:t1:jane@test.com:1.2.3.4";

    @BeforeEach
    void setUp() {
        lenient().when(redis.opsForValue()).thenReturn(valueOps);
        guard = new LoginAttemptGuard(redis, 5, 15);
    }

    @Test
    void isBlocked_belowThreshold_returnsFalse() {
        when(valueOps.get(KEY)).thenReturn("4");
        assertThat(guard.isBlocked("login:t1", "jane@test.com", "1.2.3.4")).isFalse();
    }

    @Test
    void isBlocked_atThreshold_returnsTrue() {
        when(valueOps.get(KEY)).thenReturn("5");
        assertThat(guard.isBlocked("login:t1", "jane@test.com", "1.2.3.4")).isTrue();
    }

    @Test
    void isBlocked_noPriorAttempts_returnsFalse() {
        when(valueOps.get(KEY)).thenReturn(null);
        assertThat(guard.isBlocked("login:t1", "jane@test.com", "1.2.3.4")).isFalse();
    }

    @Test
    void recordFailure_firstAttempt_setsWindowTtl() {
        when(valueOps.increment(KEY)).thenReturn(1L);
        guard.recordFailure("login:t1", "jane@test.com", "1.2.3.4");
        verify(redis).expire(KEY, Duration.ofMinutes(15));
    }

    @Test
    void recordFailure_subsequentAttempt_doesNotResetTtl() {
        when(valueOps.increment(KEY)).thenReturn(3L);
        guard.recordFailure("login:t1", "jane@test.com", "1.2.3.4");
        verify(redis, never()).expire(eq(KEY), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void reset_deletesTheCounter() {
        guard.reset("login:t1", "jane@test.com", "1.2.3.4");
        verify(redis).delete(KEY);
    }
}
