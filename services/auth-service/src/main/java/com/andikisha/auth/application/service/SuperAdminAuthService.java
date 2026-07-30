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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(SuperAdminAuthService.class);

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

    public SuperAdminAuthService(UserRepository userRepository,
                                 JwtTokenProvider jwtTokenProvider,
                                 PasswordEncoder passwordEncoder,
                                 SuperAdminSessionRepository sessionRepository,
                                 @Value("${app.provision-secret}") String provisionSecret) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.sessionRepository = sessionRepository;
        this.provisionSecret = provisionSecret;
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
    public SuperAdminTokenResponse login(SuperAdminLoginRequest request) {
        User admin = userRepository
                .findByEmailAndTenantIdAndRole(
                        request.email().toLowerCase().trim(), SYSTEM_TENANT, Role.SUPER_ADMIN)
                .filter(User::isActive)
                .orElse(null);

        // Uniform rejection (audit M3/M4): unknown/inactive returns the same INVALID_CREDENTIALS and
        // incurs the same BCrypt cost, so neither the response nor the timing reveals account state.
        if (admin == null) {
            passwordEncoder.matches(request.password(), DUMMY_HASH);
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            // The single SUPER_ADMIN account is deliberately NOT self-locked (audit M6): a hard
            // time-lock on the platform's only operator is a self-inflicted platform-admin DoS that
            // anyone knowing the email could trigger. Online brute-force is instead contained by the
            // edge rate limit + the mandatory strong-password policy; failures are logged for
            // out-of-band detection rather than locking the account.
            log.warn("Failed SUPER_ADMIN login attempt for {}", admin.getEmail());
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

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

        // AUTH-BACKLOG-008: a malformed (non-UUID) principal must be a clean authorization
        // denial, not an unhandled IllegalArgumentException that surfaces as a masked 500.
        java.util.UUID adminId;
        try {
            adminId = java.util.UUID.fromString(requestingUserId);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("FORBIDDEN",
                    "Only SUPER_ADMIN users can impersonate tenants");
        }

        User admin = userRepository.findById(adminId)
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
