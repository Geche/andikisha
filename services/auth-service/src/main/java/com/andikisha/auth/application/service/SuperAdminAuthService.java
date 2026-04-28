package com.andikisha.auth.application.service;

import com.andikisha.auth.application.dto.request.SuperAdminLoginRequest;
import com.andikisha.auth.application.dto.request.SuperAdminProvisionRequest;
import com.andikisha.auth.application.dto.response.ImpersonationResponse;
import com.andikisha.auth.application.dto.response.SuperAdminProvisionResponse;
import com.andikisha.auth.application.dto.response.SuperAdminTokenResponse;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class SuperAdminAuthService {

    private static final String SYSTEM_TENANT = "SYSTEM";
    private static final long SUPER_ADMIN_TOKEN_TTL_MS = 60 * 60 * 1000L;      // 1 hour
    private static final long SUPER_ADMIN_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days
    private static final long IMPERSONATION_TOKEN_TTL_MS = 30 * 60 * 1000L;    // 30 minutes

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{12,}$");

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminAuthService(UserRepository userRepository,
                                 JwtTokenProvider jwtTokenProvider,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SuperAdminProvisionResponse provision(SuperAdminProvisionRequest request) {
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

    public SuperAdminTokenResponse login(SuperAdminLoginRequest request) {
        User admin = userRepository
                .findByEmailAndTenantIdAndRole(
                        request.email().toLowerCase().trim(), SYSTEM_TENANT, Role.SUPER_ADMIN)
                .filter(User::isActive)
                .orElseThrow(() -> new BusinessRuleException("INVALID_CREDENTIALS",
                        "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }

        String accessToken = jwtTokenProvider.generateSuperAdminToken(
                admin.getId().toString(), SUPER_ADMIN_TOKEN_TTL_MS);
        String refreshToken = jwtTokenProvider.generateSuperAdminRefreshToken(
                admin.getId().toString(), SUPER_ADMIN_REFRESH_TTL_MS);

        return new SuperAdminTokenResponse(accessToken, refreshToken,
                SUPER_ADMIN_TOKEN_TTL_MS / 1000, "SUPER_ADMIN", SYSTEM_TENANT);
    }

    @Transactional
    public ImpersonationResponse impersonate(String requestingUserId, String targetTenantId) {
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
}
