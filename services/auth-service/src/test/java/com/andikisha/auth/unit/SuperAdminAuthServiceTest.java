package com.andikisha.auth.unit;

import com.andikisha.auth.application.dto.request.SuperAdminLoginRequest;
import com.andikisha.auth.application.dto.request.SuperAdminProvisionRequest;
import com.andikisha.auth.application.dto.response.ImpersonationResponse;
import com.andikisha.auth.application.dto.response.SuperAdminProvisionResponse;
import com.andikisha.auth.application.dto.response.SuperAdminTokenResponse;
import com.andikisha.auth.application.service.SuperAdminAuthService;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.auth.domain.exception.AccountLockedException;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuperAdminAuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private PasswordEncoder passwordEncoder;

    private SuperAdminAuthService service;

    private static final String EMAIL = "admin@system.internal";
    private static final String STRONG_PASSWORD = "Str0ng!Pass#2024";
    private static final String HASHED = "$2a$hash";
    private static final String SYSTEM = "SYSTEM";
    private static final String ACCESS_TOKEN = "access.jwt";
    private static final String REFRESH_TOKEN = "refresh.jwt";
    private static final String IMPERSONATION_TOKEN = "impersonation.jwt";

    @BeforeEach
    void setUp() {
        service = new SuperAdminAuthService(userRepository, jwtTokenProvider, passwordEncoder);
    }

    private User buildSuperAdmin() {
        User admin = User.create(SYSTEM, EMAIL, "N/A", HASHED, Role.SUPER_ADMIN);
        try {
            Field id = admin.getClass().getSuperclass().getDeclaredField("id");
            id.setAccessible(true);
            id.set(admin, UUID.randomUUID());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return admin;
    }

    // ── provision ─────────────────────────────────────────────────────────────

    @Test
    void provision_firstTime_createsAndReturnsResponse() {
        when(userRepository.existsByRoleAndTenantId(Role.SUPER_ADMIN, SYSTEM)).thenReturn(false);
        when(passwordEncoder.encode(STRONG_PASSWORD)).thenReturn(HASHED);
        User saved = buildSuperAdmin();
        when(userRepository.save(any())).thenReturn(saved);

        SuperAdminProvisionResponse response = service.provision(
                new SuperAdminProvisionRequest(EMAIL, STRONG_PASSWORD));

        assertThat(response.email()).isEqualTo(EMAIL);
        assertThat(response.role()).isEqualTo("SUPER_ADMIN");
        verify(userRepository).save(any());
    }

    @Test
    void provision_alreadyProvisioned_throwsDuplicateResourceException() {
        when(userRepository.existsByRoleAndTenantId(Role.SUPER_ADMIN, SYSTEM)).thenReturn(true);

        assertThatThrownBy(() ->
                service.provision(new SuperAdminProvisionRequest(EMAIL, STRONG_PASSWORD)))
                .isInstanceOf(DuplicateResourceException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void provision_weakPassword_throwsBusinessRuleException() {
        when(userRepository.existsByRoleAndTenantId(Role.SUPER_ADMIN, SYSTEM)).thenReturn(false);

        assertThatThrownBy(() ->
                service.provision(new SuperAdminProvisionRequest(EMAIL, "weak")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Password must be at least 12 characters");
    }

    @Test
    void provision_passwordWithoutSpecialChar_throwsBusinessRuleException() {
        when(userRepository.existsByRoleAndTenantId(Role.SUPER_ADMIN, SYSTEM)).thenReturn(false);

        assertThatThrownBy(() ->
                service.provision(new SuperAdminProvisionRequest(EMAIL, "NoSpecialChar1234")))
                .isInstanceOf(BusinessRuleException.class);
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returnsTokens() {
        User admin = buildSuperAdmin();
        when(userRepository.findByEmailAndTenantIdAndRole(EMAIL, SYSTEM, Role.SUPER_ADMIN))
                .thenReturn(Optional.of(admin));
        when(passwordEncoder.matches(STRONG_PASSWORD, HASHED)).thenReturn(true);
        when(jwtTokenProvider.generateSuperAdminToken(anyString(), anyLong()))
                .thenReturn(ACCESS_TOKEN)
                .thenReturn(REFRESH_TOKEN);

        SuperAdminTokenResponse response = service.login(
                new SuperAdminLoginRequest(EMAIL, STRONG_PASSWORD));

        assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
        assertThat(response.role()).isEqualTo("SUPER_ADMIN");
        assertThat(response.tenantId()).isEqualTo(SYSTEM);
    }

    @Test
    void login_wrongPassword_throwsBusinessRuleException() {
        User admin = buildSuperAdmin();
        when(userRepository.findByEmailAndTenantIdAndRole(EMAIL, SYSTEM, Role.SUPER_ADMIN))
                .thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", HASHED)).thenReturn(false);

        assertThatThrownBy(() ->
                service.login(new SuperAdminLoginRequest(EMAIL, "wrong")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_unknownEmail_throwsBusinessRuleException() {
        when(userRepository.findByEmailAndTenantIdAndRole(anyString(), anyString(), any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.login(new SuperAdminLoginRequest("nobody@x.com", STRONG_PASSWORD)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    @org.junit.jupiter.api.DisplayName("SuperAdmin account locks after 5 failed login attempts")
    void login_fiveFailedAttempts_accountLocked() {
        User superAdmin = buildSuperAdmin();
        when(userRepository.findByEmailAndTenantIdAndRole(EMAIL, SYSTEM, Role.SUPER_ADMIN))
                .thenReturn(Optional.of(superAdmin));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        // 5 failed attempts — mutates state on the real User object
        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> service.login(
                    new SuperAdminLoginRequest(EMAIL, "wrongpassword")))
                    .isInstanceOf(BusinessRuleException.class);
        }

        // 6th attempt — lock check fires before password check, so this stub is lenient
        lenient().when(passwordEncoder.matches(any(), any())).thenReturn(true);
        assertThatThrownBy(() -> service.login(
                new SuperAdminLoginRequest(EMAIL, "correctpassword")))
                .isInstanceOf(AccountLockedException.class)
                .hasMessageContaining("locked");
    }

    // ── impersonate ───────────────────────────────────────────────────────────

    @Test
    void impersonate_validSuperAdmin_returnsImpersonationToken() {
        User admin = buildSuperAdmin();
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(jwtTokenProvider.generateImpersonationToken(anyString(), anyString(), anyLong()))
                .thenReturn(IMPERSONATION_TOKEN);

        ImpersonationResponse response = service.impersonate(
                admin.getId().toString(), "target-tenant");

        assertThat(response.impersonationToken()).isEqualTo(IMPERSONATION_TOKEN);
        assertThat(response.targetTenantId()).isEqualTo("target-tenant");
        assertThat(response.expiresAt()).isNotNull();
    }

    @Test
    void impersonate_nonExistentAdmin_throwsBusinessRuleException() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.impersonate(unknownId.toString(), "target-tenant"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Only SUPER_ADMIN users can impersonate");
    }
}
