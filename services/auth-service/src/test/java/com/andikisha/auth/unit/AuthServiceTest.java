package com.andikisha.auth.unit;

import com.andikisha.auth.application.dto.request.LoginRequest;
import com.andikisha.auth.application.dto.request.RegisterRequest;
import com.andikisha.auth.application.dto.response.TokenResponse;
import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.mapper.UserMapper;
import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.application.service.JwtTokenProvider;
import com.andikisha.auth.domain.exception.InvalidCredentialsException;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.RefreshTokenRepository;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;
    @Mock private AuthEventPublisher eventPublisher;

    @InjectMocks private AuthService authService;

    private static final String TENANT_ID = "test-tenant";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void register_withValidRequest_createsUserAndReturnsTokens() {
        var request = new RegisterRequest(
                "jane@test.com", "+254722123456", "Password123", "HR"
        );

        when(userRepository.existsByEmailAndTenantId("jane@test.com", TENANT_ID))
                .thenReturn(false);
        when(userRepository.existsByPhoneNumberAndTenantId("+254722123456", TENANT_ID))
                .thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token");
        when(jwtTokenProvider.getRefreshTokenExpiry()).thenReturn(Instant.now().plusSeconds(3600));
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);
        when(userMapper.toResponse(any())).thenReturn(
                new UserResponse(UUID.randomUUID(), TENANT_ID, "jane@test.com",
                        "+254722123456", "HR", null, true, null, LocalDateTime.now())
        );

        TokenResponse result = authService.register(request);

        assertThat(result.accessToken()).isEqualTo("access-token");
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
        assertThat(result.tokenType()).isEqualTo("Bearer");
        verify(eventPublisher).publishUserRegistered(any(User.class));
    }

    @Test
    void register_withDuplicateEmail_throwsDuplicateException() {
        var request = new RegisterRequest(
                "existing@test.com", "+254722123456", "Password123", "HR"
        );

        when(userRepository.existsByEmailAndTenantId("existing@test.com", TENANT_ID))
                .thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("email");
    }

    @Test
    void login_withValidCredentials_returnsTokens() {
        var request = new LoginRequest("jane@test.com", "Password123");

        User user = User.create(TENANT_ID, "jane@test.com",
                "+254722123456", "hashed", Role.MANAGER);

        when(userRepository.findByEmailAndTenantId("jane@test.com", TENANT_ID))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "hashed")).thenReturn(true);
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token");
        when(jwtTokenProvider.getRefreshTokenExpiry()).thenReturn(Instant.now().plusSeconds(3600));
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);
        when(userMapper.toResponse(any())).thenReturn(
                new UserResponse(UUID.randomUUID(), TENANT_ID, "jane@test.com",
                        "+254722123456", "HR", null, true, null, LocalDateTime.now())
        );

        TokenResponse result = authService.login(request);

        assertThat(result.accessToken()).isNotNull();
        verify(refreshTokenRepository).revokeAllByUserIdAndTenantId(any(), eq(TENANT_ID));
    }

    @Test
    void login_withWrongPassword_throwsInvalidCredentials() {
        var request = new LoginRequest("jane@test.com", "WrongPassword");

        User user = User.create(TENANT_ID, "jane@test.com",
                "+254722123456", "hashed", Role.MANAGER);

        when(userRepository.findByEmailAndTenantId("jane@test.com", TENANT_ID))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed")).thenReturn(false);
        when(userRepository.save(any())).thenReturn(user);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_withNonExistentEmail_throwsInvalidCredentials() {
        var request = new LoginRequest("nobody@test.com", "Password123");

        when(userRepository.findByEmailAndTenantId("nobody@test.com", TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}