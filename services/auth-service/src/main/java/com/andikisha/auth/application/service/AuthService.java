package com.andikisha.auth.application.service;

import com.andikisha.auth.application.dto.request.ChangePasswordRequest;
import com.andikisha.auth.application.dto.request.ChangeRoleRequest;
import com.andikisha.auth.application.dto.request.ForgotPasswordRequest;
import com.andikisha.auth.application.dto.request.LoginRequest;
import com.andikisha.auth.application.dto.request.RefreshTokenRequest;
import com.andikisha.auth.application.dto.request.RegisterRequest;
import com.andikisha.auth.application.dto.request.InviteUserRequest;
import com.andikisha.auth.application.dto.request.ResetPasswordRequest;
import com.andikisha.auth.application.dto.response.AdminPasswordResetResponse;
import com.andikisha.auth.application.dto.response.InviteUserResponse;
import com.andikisha.auth.application.dto.response.TokenResponse;
import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.mapper.UserMapper;
import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.domain.exception.AccountLockedException;
import com.andikisha.auth.domain.exception.InvalidCredentialsException;
import com.andikisha.auth.domain.exception.TokenExpiredException;
import com.andikisha.auth.domain.model.RefreshToken;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.RefreshTokenRepository;
import com.andikisha.auth.domain.repository.RolePermissionRepository;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.common.scope.DepartmentScopeException;
import io.jsonwebtoken.JwtException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuthEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;
    private final EmployeeGrpcClient employeeGrpcClient;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       RolePermissionRepository rolePermissionRepository,
                       JwtTokenProvider jwtTokenProvider,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       AuthEventPublisher eventPublisher,
                       StringRedisTemplate redisTemplate,
                       EmployeeGrpcClient employeeGrpcClient) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.eventPublisher = eventPublisher;
        this.redisTemplate = redisTemplate;
        this.employeeGrpcClient = employeeGrpcClient;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String tenantId = TenantContext.requireTenantId();

        if (userRepository.existsByEmailAndTenantId(request.email(), tenantId)) {
            throw new DuplicateResourceException("User", "email", request.email());
        }
        if (userRepository.existsByPhoneNumberAndTenantId(request.phoneNumber(), tenantId)) {
            throw new DuplicateResourceException("User", "phoneNumber", request.phoneNumber());
        }
        if (userRepository.existsByEmployeeIdAndTenantId(request.employeeId(), tenantId)) {
            throw new DuplicateResourceException("User", "employeeId", request.employeeId().toString());
        }

        String passwordHash = passwordEncoder.encode(request.password());

        User user = User.create(tenantId, request.email(),
                request.phoneNumber(), passwordHash, Role.EMPLOYEE);
        user.linkEmployee(request.employeeId());
        user = userRepository.save(user);

        final User savedUser = user;
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(savedUser);
                }
            });
        } else {
            eventPublisher.publishUserRegistered(savedUser);
        }

        return generateTokenResponse(user);
    }

    @Transactional
    public String provisionTenantAdmin(String tenantId, String email,
                                       String firstName, String lastName,
                                       String phone, String temporaryPassword,
                                       UUID employeeId) {
        if (userRepository.existsByEmailAndTenantId(email, tenantId)) {
            // Idempotent — if called twice, return existing userId
            return userRepository.findByEmailAndTenantId(email, tenantId)
                    .map(u -> u.getId().toString())
                    .orElseThrow(() -> new IllegalStateException(
                            "User exists by email query but not found by ID for tenantId=" + tenantId));
        }
        String passwordHash = passwordEncoder.encode(temporaryPassword);
        User admin = User.create(tenantId, email, phone, passwordHash, Role.ADMIN);
        if (employeeId != null) {
            admin.linkEmployee(employeeId);
        } else {
            // TODO: ADMIN created without employeeId at tenant provisioning time (chicken-and-egg —
            // no employee-service records exist yet). The EmployeeCreatedListener will link the
            // admin to their employee record once they create one in employee-service.
            // Tracked: docs/Engineering/2026-05-22-role-permissions-onboarding-plan.md §1.1
            org.slf4j.LoggerFactory.getLogger(AuthService.class).warn(
                    "Provisioning ADMIN user without employeeId: tenantId={} email={}. " +
                    "Link must be established when admin creates their employee record.", tenantId, email);
        }
        User savedAdmin = userRepository.save(admin);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(savedAdmin);
                }
            });
        } else {
            eventPublisher.publishUserRegistered(savedAdmin);
        }
        return savedAdmin.getId().toString();
    }

    @Transactional
    public String provisionEmployeeUser(String tenantId, String email,
                                        String phone, String initialPassword,
                                        String employeeId) {
        if (userRepository.existsByEmailAndTenantId(email, tenantId)) {
            return userRepository.findByEmailAndTenantId(email, tenantId)
                    .map(existing -> {
                        // If user exists but has no employeeId yet (e.g. ADMIN creating their own
                        // employee record), link it now.
                        if (existing.getEmployeeId() == null && existing.getRole() != Role.SUPER_ADMIN) {
                            existing.linkEmployee(UUID.fromString(employeeId));
                            resolveDisplayName(tenantId, employeeId).ifPresent(existing::setDisplayName);
                            userRepository.save(existing);
                            org.slf4j.LoggerFactory.getLogger(AuthService.class).info(
                                    "Linked employeeId={} to existing user id={} tenantId={}",
                                    employeeId, existing.getId(), tenantId);
                        }
                        return existing.getId().toString();
                    })
                    .orElseThrow(() -> new IllegalStateException(
                            "User exists by email but not found for tenantId=" + tenantId));
        }
        String passwordHash = passwordEncoder.encode(initialPassword);
        User employee = User.create(tenantId, email, phone, passwordHash, Role.EMPLOYEE);
        employee.linkEmployee(UUID.fromString(employeeId));
        resolveDisplayName(tenantId, employeeId).ifPresent(employee::setDisplayName);
        User saved = userRepository.save(employee);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(saved);
                }
            });
        } else {
            eventPublisher.publishUserRegistered(saved);
        }
        return saved.getId().toString();
    }

    /**
     * R3-2c (TENANT-006): invite a standalone admin-tier user (no employee record). Reuses
     * the temp-password + mustChangePassword pattern (AUTH-006); the password is returned
     * once for the admin to share (no email infrastructure yet). ADMIN-only at the controller.
     * Role must be in {@link Role#ADMIN_TIER} — self-service roles (EMPLOYEE, LINE_MANAGER)
     * come through hire/provisioning and require an employee record (V17 constraint).
     */
    @Transactional
    public InviteUserResponse inviteUser(UUID performerId, InviteUserRequest request) {
        String tenantId = TenantContext.requireTenantId();

        Role role;
        try {
            role = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_ROLE", "Unknown role: " + request.role());
        }
        if (!Role.ADMIN_TIER.contains(role)) {
            throw new BusinessRuleException("INVALID_INVITE_ROLE",
                    role.name() + " cannot be invited. Invitable roles: " + Role.ADMIN_TIER
                    + ". Employees are added through the employee directory.");
        }

        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmailAndTenantId(email, tenantId)) {
            throw new DuplicateResourceException("User", "email", email);
        }
        if (userRepository.existsByPhoneNumberAndTenantId(request.phoneNumber(), tenantId)) {
            throw new DuplicateResourceException("User", "phoneNumber", request.phoneNumber());
        }

        String tempPassword = com.andikisha.common.util.PasswordGenerator.generate();
        User user = User.create(tenantId, email, request.phoneNumber(),
                passwordEncoder.encode(tempPassword), role); // mustChangePassword=true by default
        User saved = userRepository.save(user);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(saved);
                }
            });
        } else {
            eventPublisher.publishUserRegistered(saved);
        }

        return new InviteUserResponse(saved.getId().toString(), saved.getEmail(),
                role.name(), tempPassword);
    }

    /**
     * Resolve a user's display name from the linked employee record. Cold path only
     * (provisioning + backfill) — never call this on a read hot path like /me.
     * Empty when the employee can't be resolved, so the caller leaves display_name null
     * and the read path falls back to email.
     */
    private java.util.Optional<String> resolveDisplayName(String tenantId, String employeeId) {
        return employeeGrpcClient.getEmployee(tenantId, employeeId)
                .map(emp -> (emp.getFirstName() + " " + emp.getLastName()).trim())
                .filter(name -> !name.isBlank());
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        String tenantId = TenantContext.requireTenantId();

        User user = userRepository.findByEmailAndTenantId(
                        request.email().toLowerCase().trim(), tenantId)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        user.clearLockIfExpired();
        if (user.isLocked()) {
            throw new AccountLockedException(
                    "Account temporarily locked due to too many failed attempts. Please try again later.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            user.recordFailedLogin();
            userRepository.save(user);
            throw new InvalidCredentialsException();
        }

        user.recordSuccessfulLogin();
        userRepository.save(user);

        // Revoke any existing refresh tokens for this user
        refreshTokenRepository.revokeAllByUserIdAndTenantId(user.getId(), tenantId);

        return generateTokenResponse(user);
    }

    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        String tenantId = TenantContext.requireTenantId();

        try {
            String type = jwtTokenProvider.getClaims(request.refreshToken()).get("type", String.class);
            if (!"refresh".equals(type)) throw new TokenExpiredException();
        } catch (JwtException e) {
            throw new TokenExpiredException();
        }

        RefreshToken storedToken = refreshTokenRepository
                .findByTokenAndTenantId(request.refreshToken(), tenantId)
                .orElseThrow(TokenExpiredException::new);

        if (!storedToken.isValid()) {
            throw new TokenExpiredException();
        }

        // Revoke the used refresh token (rotation)
        storedToken.revoke();
        refreshTokenRepository.save(storedToken);

        User user = userRepository.findByIdAndTenantId(storedToken.getUserId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", storedToken.getUserId()));

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        return generateTokenResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        String tenantId = TenantContext.requireTenantId();

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            // Caller is already authenticated here, so no enumeration risk —
            // be specific instead of the vague login message.
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        user.changePassword(passwordEncoder.encode(request.newPassword()));
        user.clearMustChangePassword();
        userRepository.save(user);

        // Revoke all refresh tokens to force re-login on other devices
        refreshTokenRepository.revokeAllByUserIdAndTenantId(userId, tenantId);
    }

    @Transactional
    public void logout(UUID userId) {
        String tenantId = TenantContext.requireTenantId();
        refreshTokenRepository.revokeAllByUserIdAndTenantId(userId, tenantId);
    }

    public UserResponse getUser(UUID userId) {
        String tenantId = TenantContext.requireTenantId();
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return userMapper.toResponse(user);
    }

    public boolean checkPermission(String tenantId, UUID userId,
                                    String resource, String action, String scope) {
        User user = userRepository.findByIdAndTenantId(userId, tenantId).orElse(null);
        if (user == null || !user.isActive()) return false;

        if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.ADMIN) return true;

        return rolePermissionRepository.hasPermission(tenantId, user.getRole(), resource, action, scope);
    }

    public UserResponse getUserByEmployeeId(String tenantId, UUID employeeId) {
        User user = userRepository.findByEmployeeIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", employeeId));
        return userMapper.toResponse(user);
    }

    /**
     * AUTH-007: re-resolve and update a user's {@code display_name} from the linked
     * employee record after an {@code employee.updated} event. Option A — re-resolves via
     * gRPC (cold path; the event carries no name fields, so no event-contract change).
     * Idempotent and quiet: a missing linked user, an unresolvable name (employee-service
     * down), or an unchanged name is a no-op. If the event is missed the name stays stale
     * until the next update — acceptable because the read path falls back to email and
     * never depends on freshness.
     */
    @Transactional
    public void syncDisplayNameFromEmployee(String tenantId, String employeeId) {
        User user = userRepository.findByEmployeeIdAndTenantId(UUID.fromString(employeeId), tenantId)
                .orElse(null);
        if (user == null) {
            return; // employee has no linked auth user (yet) — nothing to sync
        }
        java.util.Optional<String> resolved = resolveDisplayName(tenantId, employeeId);
        if (resolved.isEmpty() || resolved.get().equals(user.getDisplayName())) {
            return; // unresolvable (keep current) or unchanged
        }
        user.setDisplayName(resolved.get());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public void forgotPassword(ForgotPasswordRequest request) {
        String tenantId = TenantContext.requireTenantId();
        // Respond identically whether the email exists or not to prevent user enumeration.
        userRepository.findByEmailAndTenantId(
                request.email().toLowerCase().trim(), tenantId)
                .ifPresent(user -> {
                    String token = com.andikisha.common.util.PasswordGenerator.generate();
                    String redisKey = RedisKeys.passwordReset(token);
                    // Value format: "{userId}:{tenantId}" for retrieval on reset.
                    redisTemplate.opsForValue().set(
                            redisKey,
                            user.getId() + ":" + tenantId,
                            Duration.ofHours(1));
                    eventPublisher.publishPasswordResetRequested(tenantId, request.email(), token);
                });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String redisKey = RedisKeys.passwordReset(request.token());
        String stored = redisTemplate.opsForValue().get(redisKey);
        if (stored == null) {
            throw new com.andikisha.common.exception.BusinessRuleException(
                    "Reset token is invalid or has expired.");
        }

        String[] parts = stored.split(":", 2);
        UUID userId = UUID.fromString(parts[0]);
        String tenantId = parts[1];

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.changePassword(passwordEncoder.encode(request.newPassword()));
        user.clearMustChangePassword();
        userRepository.save(user);

        redisTemplate.delete(redisKey);
        refreshTokenRepository.revokeAllByUserIdAndTenantId(userId, tenantId);
    }

    private TokenResponse generateTokenResponse(User user) {
        String planTier = redisTemplate.opsForValue().get(RedisKeys.tenantPlanTier(user.getTenantId()));
        String accessToken = jwtTokenProvider.generateAccessToken(user, planTier);
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.create(
                user.getId(),
                user.getTenantId(),
                refreshTokenStr,
                jwtTokenProvider.getRefreshTokenExpiry()
        );
        refreshTokenRepository.save(refreshToken);

        UserResponse userResponse = userMapper.toResponse(user);

        return new TokenResponse(
                accessToken,
                refreshTokenStr,
                jwtTokenProvider.getAccessTokenExpirationMs() / 1000,
                userResponse
        );
    }

    /**
     * Reset the tenant admin's password to a new temporary password.
     * Sets must_change_password = true so the admin is forced to change
     * on next login. All active refresh tokens are revoked.
     *
     * Called via gRPC by tenant-service on behalf of a SUPER_ADMIN action.
     *
     * @return the userId of the affected admin
     * @throws ResourceNotFoundException if no user exists with this email in this tenant
     */
    @Transactional
    public String resetTenantAdminPassword(String tenantId, String email, String newPassword) {
        User user = userRepository.findByEmailAndTenantId(email, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "tenantId=" + tenantId + " email=" + email));

        user.changePassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        User saved = userRepository.save(user);

        refreshTokenRepository.revokeAllByUserIdAndTenantId(saved.getId(), tenantId);

        return saved.getId().toString();
    }

    /**
     * Change a user's role. Enforces:
     * - SUPER_ADMIN cannot be assigned and target cannot be SUPER_ADMIN.
     * - If the new role has any :department permission, the target's linked employee
     *   must have a department (Option C).
     * - Revokes all refresh tokens so the user re-authenticates with the new role.
     * - Publishes a RoleChanged audit event.
     */
    @Transactional
    public UserResponse changeUserRole(UUID changerId, UUID targetUserId, ChangeRoleRequest request) {
        String tenantId = TenantContext.requireTenantId();

        Role newRole;
        try {
            newRole = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_ROLE", "Unknown role: " + request.role());
        }

        if (newRole == Role.SUPER_ADMIN) {
            throw new BusinessRuleException("FORBIDDEN_ROLE",
                    "SUPER_ADMIN cannot be assigned through this endpoint.");
        }
        // R3-0: only enforced operational roles are assignable. Reserved/future enum
        // values (PAYROLL_MANAGER, FINANCE_OFFICER, CHIEF_*, AUDITOR) have no grants
        // and must not be assigned, or a user would hold a role nothing recognises.
        if (!Role.OPERATIONAL.contains(newRole)) {
            throw new BusinessRuleException("FORBIDDEN_ROLE",
                    newRole.name() + " is a reserved role and cannot be assigned.");
        }

        User target = userRepository.findByIdAndTenantId(targetUserId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId));

        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new BusinessRuleException("FORBIDDEN_TARGET",
                    "Cannot change the role of a SUPER_ADMIN user.");
        }

        // Option C: if the new role requires department scope, verify the employee has one
        boolean needsDept = rolePermissionRepository
                .findPermissionStringsByTenantIdAndRole("SYSTEM", newRole)
                .stream()
                .anyMatch(p -> p.endsWith(":department"));

        if (needsDept) {
            String employeeId = target.getEmployeeId() != null
                    ? target.getEmployeeId().toString() : null;
            if (employeeId == null) {
                throw new DepartmentScopeException(
                        "Cannot assign " + newRole.name()
                        + " — the employee must be assigned to a department first.");
            }
            boolean hasDept = employeeGrpcClient.getEmployee(tenantId, employeeId)
                    .filter(e -> !e.getDepartmentId().isBlank())
                    .isPresent();
            if (!hasDept) {
                throw new DepartmentScopeException(
                        "Cannot assign " + newRole.name()
                        + " — the employee must be assigned to a department first.");
            }
        }

        Role oldRole = target.getRole();
        target.changeRole(newRole);
        User saved = userRepository.save(target);

        // Revoke all refresh tokens — user must re-authenticate to get new role JWT
        refreshTokenRepository.revokeAllByUserIdAndTenantId(targetUserId, tenantId);

        // Audit event
        final String changerIdStr = changerId.toString();
        final String targetIdStr  = targetUserId.toString();
        final String oldRoleStr   = oldRole.name();
        final String newRoleStr   = newRole.name();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishRoleChanged(tenantId, changerIdStr, targetIdStr,
                            oldRoleStr, newRoleStr);
                }
            });
        } else {
            eventPublisher.publishRoleChanged(tenantId, changerIdStr, targetIdStr,
                    oldRoleStr, newRoleStr);
        }

        return userMapper.toResponse(saved);
    }

    /**
     * R3-2b (TENANT-005): activate/deactivate a tenant user (soft-delete via is_active).
     * One method serves both directions. Deactivation blocks login + refresh immediately
     * (both check is_active) and revokes existing refresh tokens; an already-issued access
     * token stays valid until its TTL (graceful expiry — no gateway denylist in v1, see
     * docs/decisions/2026-06-14-run-03-user-deactivation.md). Guards enforced server-side
     * (UI guards are bypassable): cannot deactivate the last active ADMIN, cannot deactivate
     * yourself. ADMIN-only (enforced at the controller).
     */
    @Transactional
    public UserResponse setUserActive(UUID changerId, UUID targetUserId, boolean active) {
        String tenantId = TenantContext.requireTenantId();

        User target = userRepository.findByIdAndTenantId(targetUserId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId));

        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new BusinessRuleException("FORBIDDEN_TARGET",
                    "A SUPER_ADMIN account cannot be deactivated here.");
        }

        if (!active) {
            if (targetUserId.equals(changerId)) {
                throw new BusinessRuleException("SELF_DEACTIVATION",
                        "You cannot deactivate your own account.");
            }
            boolean isLastActiveAdmin = target.getRole() == Role.ADMIN
                    && !userRepository.existsByTenantIdAndRoleAndActiveTrueAndIdNot(
                            tenantId, Role.ADMIN, targetUserId);
            if (isLastActiveAdmin) {
                throw new BusinessRuleException("LAST_ACTIVE_ADMIN",
                        "Cannot deactivate the last active administrator. Assign another admin first.");
            }
            target.deactivate();
            // Block refresh immediately; access tokens lapse within their TTL (graceful expiry).
            refreshTokenRepository.revokeAllByUserIdAndTenantId(targetUserId, tenantId);
        } else {
            target.activate();
        }

        return userMapper.toResponse(userRepository.save(target));
    }

    /**
     * Admin-initiated password reset. ADMIN and HR_MANAGER may reset any employee's password.
     * HR_MANAGER may not reset an ADMIN's password.
     * Generates a temp password, sets mustChangePassword, revokes refresh tokens, emits audit event.
     */
    @Transactional
    public AdminPasswordResetResponse adminPasswordReset(UUID performerId, Role performerRole,
                                                          UUID targetUserId) {
        String tenantId = TenantContext.requireTenantId();

        User target = userRepository.findByIdAndTenantId(targetUserId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId));

        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new BusinessRuleException("FORBIDDEN_TARGET",
                    "Cannot reset a SUPER_ADMIN password.");
        }
        if (performerRole == Role.HR_MANAGER && target.getRole() == Role.ADMIN) {
            throw new BusinessRuleException("FORBIDDEN_TARGET",
                    "HR_MANAGER cannot reset an ADMIN password.");
        }

        String tempPassword = com.andikisha.common.util.PasswordGenerator.generate();
        target.changePassword(passwordEncoder.encode(tempPassword));
        target.setMustChangePassword(true);
        userRepository.save(target);

        refreshTokenRepository.revokeAllByUserIdAndTenantId(targetUserId, tenantId);

        final String performerIdStr = performerId.toString();
        final String targetIdStr    = targetUserId.toString();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishAdminPasswordReset(tenantId, performerIdStr, targetIdStr);
                }
            });
        } else {
            eventPublisher.publishAdminPasswordReset(tenantId, performerIdStr, targetIdStr);
        }

        return new AdminPasswordResetResponse(
                target.getId().toString(),
                target.getEmail(),
                tempPassword);
    }

    /**
     * Provisions a user account for an employee who was bulk-uploaded.
     * Called by employee-service during the activation step.
     * Returns the email and generated temp password so HR can hand it to the employee.
     *
     * Throws {@link com.andikisha.auth.domain.exception.UserAlreadyActivatedException} when
     * the employee already has a linked user account. Activation and password-reset are
     * semantically distinct; HR should use the admin password-reset action instead.
     */
    @Transactional
    public com.andikisha.auth.application.dto.response.ProvisionEmployeeResponse provisionForActivation(
            String tenantId, UUID employeeId, String email, String phone) {
        // Refuse when this employee's account already exists. Using the employeeId link
        // (not email) is more reliable: an employee's email could theoretically be reused
        // across tenants, but the employeeId link is inherently tenant-scoped.
        if (userRepository.existsByEmployeeIdAndTenantId(employeeId, tenantId)) {
            throw new com.andikisha.auth.domain.exception.UserAlreadyActivatedException(employeeId);
        }
        String tempPassword = com.andikisha.common.util.PasswordGenerator.generate();
        provisionEmployeeUser(tenantId, email, phone, tempPassword, employeeId.toString());
        return new com.andikisha.auth.application.dto.response.ProvisionEmployeeResponse(email, tempPassword);
    }
}