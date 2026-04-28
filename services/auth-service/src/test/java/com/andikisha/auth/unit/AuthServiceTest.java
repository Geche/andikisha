package com.andikisha.auth.unit;

import com.andikisha.auth.application.dto.request.ChangePasswordRequest;
import com.andikisha.auth.application.dto.request.LoginRequest;
import com.andikisha.auth.application.dto.request.RefreshTokenRequest;
import com.andikisha.auth.application.dto.request.RegisterRequest;
import com.andikisha.auth.application.dto.response.TokenResponse;
import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.mapper.UserMapper;
import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.domain.exception.AccountLockedException;
import com.andikisha.auth.domain.exception.InvalidCredentialsException;
import com.andikisha.auth.domain.exception.TokenExpiredException;
import com.andikisha.auth.domain.model.RefreshToken;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.RefreshTokenRepository;
import com.andikisha.auth.domain.repository.RolePermissionRepository;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private RolePermissionRepository rolePermissionRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;
    @Mock private AuthEventPublisher eventPublisher;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOps;

    @InjectMocks private AuthService authService;

    private static final String TENANT_ID = "test-tenant";
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID EMPLOYEE_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User buildUser(Role role) {
        return User.create(TENANT_ID, "jane@test.com", "+254722123456", "hashed", role);
    }

    private UserResponse buildUserResponse(String role) {
        return new UserResponse(USER_ID, TENANT_ID, "jane@test.com",
                "+254722123456", role, null, true, null, LocalDateTime.now());
    }

    private void stubRefreshClaims(String token) {
        Claims claims = mock(Claims.class);
        when(claims.get("type", String.class)).thenReturn("refresh");
        when(jwtTokenProvider.getClaims(token)).thenReturn(claims);
    }

    private void stubTokenGeneration() {
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(anyString())).thenReturn(null);
        when(jwtTokenProvider.generateAccessToken(any(), any())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token");
        when(jwtTokenProvider.getRefreshTokenExpiry()).thenReturn(Instant.now().plusSeconds(3600));
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);
    }

    // ── register() ───────────────────────────────────────────────────────────

    @Nested
    class Register {

        @Test
        void withValidRequest_createsEmployeeAndReturnsTokens() {
            var request = new RegisterRequest("jane@test.com", "+254722123456", "Password123", null);

            when(userRepository.existsByEmailAndTenantId("jane@test.com", TENANT_ID)).thenReturn(false);
            when(userRepository.existsByPhoneNumberAndTenantId("+254722123456", TENANT_ID)).thenReturn(false);
            when(passwordEncoder.encode("Password123")).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            stubTokenGeneration();
            when(userMapper.toResponse(any())).thenReturn(buildUserResponse("EMPLOYEE"));

            TokenResponse result = authService.register(request);

            assertThat(result.accessToken()).isEqualTo("access-token");
            assertThat(result.refreshToken()).isEqualTo("refresh-token");
            assertThat(result.tokenType()).isEqualTo("Bearer");

            // Role is always hardcoded to EMPLOYEE regardless of request
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.EMPLOYEE);

            // Event published directly (no active transaction in unit test)
            verify(eventPublisher).publishUserRegistered(any(User.class));
        }

        @Test
        void withDuplicateEmail_throwsDuplicateException() {
            var request = new RegisterRequest("existing@test.com", "+254722123456", "Password123", null);
            when(userRepository.existsByEmailAndTenantId("existing@test.com", TENANT_ID)).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("email");

            verify(userRepository, never()).save(any());
        }

        @Test
        void withDuplicatePhone_throwsDuplicateException() {
            var request = new RegisterRequest("jane@test.com", "+254722111111", "Password123", null);
            when(userRepository.existsByEmailAndTenantId("jane@test.com", TENANT_ID)).thenReturn(false);
            when(userRepository.existsByPhoneNumberAndTenantId("+254722111111", TENANT_ID)).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("phoneNumber");

            verify(userRepository, never()).save(any());
        }
    }

    // ── login() ──────────────────────────────────────────────────────────────

    @Nested
    class Login {

        @Test
        void withValidCredentials_returnsTokensAndRevokesOldRefreshTokens() {
            var request = new LoginRequest("jane@test.com", "Password123");
            User user = buildUser(Role.EMPLOYEE);

            when(userRepository.findByEmailAndTenantId("jane@test.com", TENANT_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("Password123", "hashed")).thenReturn(true);
            when(userRepository.save(any())).thenReturn(user);
            stubTokenGeneration();
            when(userMapper.toResponse(any())).thenReturn(buildUserResponse("EMPLOYEE"));

            TokenResponse result = authService.login(request);

            assertThat(result.accessToken()).isEqualTo("access-token");
            verify(refreshTokenRepository).revokeAllByUserIdAndTenantId(any(), eq(TENANT_ID));
        }

        @Test
        void withWrongPassword_throwsInvalidCredentials() {
            var request = new LoginRequest("jane@test.com", "WrongPassword");
            User user = buildUser(Role.EMPLOYEE);

            when(userRepository.findByEmailAndTenantId("jane@test.com", TENANT_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPassword", "hashed")).thenReturn(false);
            when(userRepository.save(any())).thenReturn(user);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        void withNonExistentEmail_throwsInvalidCredentials() {
            when(userRepository.findByEmailAndTenantId("nobody@test.com", TENANT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(new LoginRequest("nobody@test.com", "pass")))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        void withLockedAccount_throwsAccountLockedException() {
            var request = new LoginRequest("jane@test.com", "Password123");
            User user = buildUser(Role.EMPLOYEE);
            // Trigger lockout by recording 5 failed attempts
            for (int i = 0; i < 5; i++) user.recordFailedLogin();

            when(userRepository.findByEmailAndTenantId("jane@test.com", TENANT_ID)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(AccountLockedException.class);
        }

        @Test
        void withInactiveUser_throwsInvalidCredentials() {
            var request = new LoginRequest("jane@test.com", "Password123");
            User user = buildUser(Role.EMPLOYEE);
            user.deactivate();

            when(userRepository.findByEmailAndTenantId("jane@test.com", TENANT_ID)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(InvalidCredentialsException.class);
        }
    }

    // ── refresh() ────────────────────────────────────────────────────────────

    @Nested
    class Refresh {

        @Test
        void withValidToken_rotatesTokenAndReturnsNewTokens() {
            var request = new RefreshTokenRequest("valid-refresh-token");
            User user = buildUser(Role.EMPLOYEE);
            RefreshToken storedToken = RefreshToken.create(USER_ID, TENANT_ID,
                    "valid-refresh-token", Instant.now().plusSeconds(3600));

            stubRefreshClaims("valid-refresh-token");
            when(refreshTokenRepository.findByTokenAndTenantId("valid-refresh-token", TENANT_ID))
                    .thenReturn(Optional.of(storedToken));
            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));
            stubTokenGeneration();
            when(userMapper.toResponse(any())).thenReturn(buildUserResponse("EMPLOYEE"));

            TokenResponse result = authService.refresh(request);

            assertThat(result.accessToken()).isEqualTo("access-token");
            assertThat(storedToken.isValid()).isFalse(); // token was revoked
            verify(refreshTokenRepository).save(storedToken);
        }

        @Test
        void withTokenNotFound_throwsTokenExpiredException() {
            stubRefreshClaims("bad-token");
            when(refreshTokenRepository.findByTokenAndTenantId("bad-token", TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("bad-token")))
                    .isInstanceOf(TokenExpiredException.class);
        }

        @Test
        void withRevokedToken_throwsTokenExpiredException() {
            RefreshToken revokedToken = RefreshToken.create(USER_ID, TENANT_ID,
                    "revoked-token", Instant.now().plusSeconds(3600));
            revokedToken.revoke();

            stubRefreshClaims("revoked-token");
            when(refreshTokenRepository.findByTokenAndTenantId("revoked-token", TENANT_ID))
                    .thenReturn(Optional.of(revokedToken));

            assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("revoked-token")))
                    .isInstanceOf(TokenExpiredException.class);
        }
    }

    // ── changePassword() ─────────────────────────────────────────────────────

    @Nested
    class ChangePassword {

        @Test
        void withCorrectCurrentPassword_updatesHashAndRevokesTokens() {
            var request = new ChangePasswordRequest("OldPass1", "NewPass1");
            User user = buildUser(Role.EMPLOYEE);

            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("OldPass1", "hashed")).thenReturn(true);
            when(passwordEncoder.encode("NewPass1")).thenReturn("new-hashed");

            authService.changePassword(USER_ID, request);

            verify(userRepository).save(user);
            verify(refreshTokenRepository).revokeAllByUserIdAndTenantId(USER_ID, TENANT_ID);
        }

        @Test
        void withWrongCurrentPassword_throwsInvalidCredentials() {
            var request = new ChangePasswordRequest("WrongOld", "NewPass1");
            User user = buildUser(Role.EMPLOYEE);

            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongOld", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> authService.changePassword(USER_ID, request))
                    .isInstanceOf(InvalidCredentialsException.class);

            verify(userRepository, never()).save(any());
        }
    }

    // ── logout() ─────────────────────────────────────────────────────────────

    @Nested
    class Logout {

        @Test
        void revokesAllRefreshTokensForUser() {
            authService.logout(USER_ID);

            verify(refreshTokenRepository).revokeAllByUserIdAndTenantId(USER_ID, TENANT_ID);
        }
    }

    // ── getUser() ────────────────────────────────────────────────────────────

    @Nested
    class GetUser {

        @Test
        void withValidId_returnsUserResponse() {
            User user = buildUser(Role.EMPLOYEE);
            UserResponse expected = buildUserResponse("EMPLOYEE");

            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = authService.getUser(USER_ID);

            assertThat(result).isEqualTo(expected);
        }

        @Test
        void withUnknownId_throwsResourceNotFoundException() {
            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getUser(USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── checkPermission() ────────────────────────────────────────────────────

    @Nested
    class CheckPermission {

        @Test
        void superAdmin_alwaysAllowed() {
            User user = buildUser(Role.SUPER_ADMIN);
            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));

            boolean result = authService.checkPermission(TENANT_ID, USER_ID, "payroll", "process", "all");

            assertThat(result).isTrue();
            verify(rolePermissionRepository, never()).hasPermission(any(), any(), any(), any(), any());
        }

        @Test
        void regularRole_delegatesToRepository() {
            User user = buildUser(Role.HR_MANAGER);
            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));
            when(rolePermissionRepository.hasPermission(TENANT_ID, Role.HR_MANAGER, "employee", "read", "all"))
                    .thenReturn(true);

            boolean result = authService.checkPermission(TENANT_ID, USER_ID, "employee", "read", "all");

            assertThat(result).isTrue();
            verify(rolePermissionRepository).hasPermission(TENANT_ID, Role.HR_MANAGER, "employee", "read", "all");
        }

        @Test
        void inactiveUser_denied() {
            User user = buildUser(Role.HR_MANAGER);
            user.deactivate();
            when(userRepository.findByIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(Optional.of(user));

            boolean result = authService.checkPermission(TENANT_ID, USER_ID, "employee", "read", "all");

            assertThat(result).isFalse();
            verify(rolePermissionRepository, never()).hasPermission(any(), any(), any(), any(), any());
        }
    }

    // ── getUserByEmployeeId() ─────────────────────────────────────────────────

    @Nested
    class GetUserByEmployeeId {

        @Test
        void found_returnsUserResponse() {
            User user = buildUser(Role.EMPLOYEE);
            user.linkEmployee(EMPLOYEE_ID);
            UserResponse expected = buildUserResponse("EMPLOYEE");

            when(userRepository.findByEmployeeIdAndTenantId(EMPLOYEE_ID, TENANT_ID)).thenReturn(Optional.of(user));
            when(userMapper.toResponse(user)).thenReturn(expected);

            UserResponse result = authService.getUserByEmployeeId(TENANT_ID, EMPLOYEE_ID);

            assertThat(result).isEqualTo(expected);
        }

        @Test
        void notFound_throwsResourceNotFoundException() {
            when(userRepository.findByEmployeeIdAndTenantId(EMPLOYEE_ID, TENANT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getUserByEmployeeId(TENANT_ID, EMPLOYEE_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
