package com.andikisha.auth.application.service;

import com.andikisha.auth.application.dto.request.SuperAdminLoginRequest;
import com.andikisha.auth.application.dto.request.SuperAdminProvisionRequest;
import com.andikisha.auth.application.dto.response.ImpersonationResponse;
import com.andikisha.auth.application.dto.response.SuperAdminProvisionResponse;
import com.andikisha.auth.application.dto.response.SuperAdminSessionResponse;
import com.andikisha.auth.application.dto.response.SuperAdminTokenResponse;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.SuperAdminSession;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.SuperAdminSessionRepository;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class SuperAdminAuthService {

    private static final String SYSTEM_TENANT = "SYSTEM";
    // Constant-work comparison hash for failed super-admin logins, so response time cannot enumerate
    // the account (audit M4). Value is irrelevant — only that it is a valid cost-12 BCrypt digest.
    private static final String DUMMY_HASH =
            "$2a$12$hFFBN0jkiqREjHGgdHHhRe8G1rOfutJ1K6zGbQm4KhG5vdjtIahSW";
    private static final long SUPER_ADMIN_TOKEN_TTL_MS = 60 * 60 * 1000L;      // 1 hour
    private static final long SUPER_ADMIN_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days
    private static final long IMPERSONATION_TOKEN_TTL_MS = 30 * 60 * 1000L;    // 30 minutes

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{12,}$");

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final SuperAdminSessionRepository sessionRepository;
    private final String provisionSecret;
    private final LoginAttemptGuard loginAttemptGuard;

    public SuperAdminAuthService(UserRepository userRepository,
                                 JwtTokenProvider jwtTokenProvider,
                                 PasswordEncoder passwordEncoder,
                                 SuperAdminSessionRepository sessionRepository,
                                 @Value("${app.provision-secret}") String provisionSecret,
                                 LoginAttemptGuard loginAttemptGuard) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.sessionRepository = sessionRepository;
        this.provisionSecret = provisionSecret;
        this.loginAttemptGuard = loginAttemptGuard;
    }

    @Transactional
    public SuperAdminProvisionResponse provision(SuperAdminProvisionRequest request) {
        if (!provisionSecret.equals(request.provisionSecret())) {
            throw new BusinessRuleException("INVALID_SECRET", "Invalid provision secret");
        }

        if (userRepository.existsByRoleAndTenantId(Role.SUPER_ADMIN, SYSTEM_TENANT)) {
            throw new DuplicateResourceException("SuperAdmin", "role",
                    "SUPER_ADMIN account has already been provisioned");
        }

        if (!PASSWORD_PATTERN.matcher(request.password()).matches()) {
            throw new BusinessRuleException("WEAK_PASSWORD",
                    "Password must be at least 12 characters with uppercase, lowercase, "
                            + "digit, and special character");
        }

        String hash = passwordEncoder.encode(request.password());
        User admin = User.create(SYSTEM_TENANT, request.email(), "N/A", hash, Role.SUPER_ADMIN);
        try {
            admin = userRepository.save(admin);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("SuperAdmin", "email", request.email());
        }

        return new SuperAdminProvisionResponse(
                admin.getId(), admin.getEmail(), admin.getRole().name(),
                admin.getCreatedAt());
    }

    @Transactional
    public SuperAdminTokenResponse login(SuperAdminLoginRequest request, String clientIp) {
        String email = request.email().toLowerCase().trim();
        String scope = "superadmin";

        // Brute-force throttle (audit M5/M6): the single SUPER_ADMIN account is a platform-admin DoS
        // target, so cap failed attempts per source IP before the lockout counter can be driven up.
        if (loginAttemptGuard.isBlocked(scope, email, clientIp)) {
            passwordEncoder.matches(request.password(), DUMMY_HASH);
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        User admin = userRepository
                .findByEmailAndTenantIdAndRole(email, SYSTEM_TENANT, Role.SUPER_ADMIN)
                .filter(User::isActive)
                .orElse(null);

        // Uniform rejection: unknown/inactive and locked both return the same INVALID_CREDENTIALS and
        // incur the same BCrypt cost, so neither the response (audit M3) nor the timing (audit M4)
        // reveals account state. The lock still applies server-side — it is just not disclosed.
        if (admin == null) {
            loginAttemptGuard.recordFailure(scope, email, clientIp);
            passwordEncoder.matches(request.password(), DUMMY_HASH);
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        admin.clearLockIfExpired();
        if (admin.isLocked()) {
            loginAttemptGuard.recordFailure(scope, email, clientIp);
            passwordEncoder.matches(request.password(), DUMMY_HASH);
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            loginAttemptGuard.recordFailure(scope, email, clientIp);
            admin.recordFailedLogin();
            userRepository.save(admin);
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        loginAttemptGuard.reset(scope, email, clientIp);

        admin.recordSuccessfulLogin();
        userRepository.save(admin);

        String accessToken = jwtTokenProvider.generateSuperAdminToken(
                admin.getId().toString(), admin.getEmail(), SUPER_ADMIN_TOKEN_TTL_MS);
        String refreshToken = jwtTokenProvider.generateSuperAdminRefreshToken(
                admin.getId().toString(), SUPER_ADMIN_REFRESH_TTL_MS);

        return new SuperAdminTokenResponse(accessToken, refreshToken,
                SUPER_ADMIN_TOKEN_TTL_MS / 1000, "SUPER_ADMIN", SYSTEM_TENANT);
    }

    @Transactional
    public ImpersonationResponse impersonate(String requestingUserId, String targetTenantId) {
        if (SYSTEM_TENANT.equalsIgnoreCase(targetTenantId)) {
            throw new BusinessRuleException("FORBIDDEN",
                    "Cannot impersonate the system tenant");
        }

        User admin = userRepository.findById(
                        java.util.UUID.fromString(requestingUserId))
                .filter(u -> u.getRole() == Role.SUPER_ADMIN)
                .orElseThrow(() -> new BusinessRuleException("FORBIDDEN",
                        "Only SUPER_ADMIN users can impersonate tenants"));

        Instant expiresAt = Instant.now().plusMillis(IMPERSONATION_TOKEN_TTL_MS);
        String token = jwtTokenProvider.generateImpersonationToken(
                requestingUserId, targetTenantId, IMPERSONATION_TOKEN_TTL_MS);

        return new ImpersonationResponse(token, expiresAt, targetTenantId);
    }

    public List<SuperAdminSessionResponse> listActiveSessions(UUID adminUserId, UUID currentSessionId) {
        return sessionRepository.findByAdminUserIdAndRevokedAtIsNullAndExpiresAtAfter(adminUserId, Instant.now())
            .stream()
            .map(s -> new SuperAdminSessionResponse(
                s.getId(), s.getCreatedAt(), s.getExpiresAt(),
                s.getIpAddress(), s.getUserAgent(),
                s.getId().equals(currentSessionId)
            ))
            .toList();
    }

    @Transactional
    public void revokeSession(UUID sessionId) {
        SuperAdminSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("SuperAdminSession", sessionId));
        session.revoke();
        sessionRepository.save(session);
    }

    @Transactional
    public SuperAdminSession createSession(UUID adminUserId, Instant expiresAt,
                                           String ipAddress, String userAgent) {
        return sessionRepository.save(
            SuperAdminSession.builder()
                .adminUserId(adminUserId)
                .expiresAt(expiresAt)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build()
        );
    }
}
