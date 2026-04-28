package com.andikisha.auth.application.service;

import com.andikisha.auth.application.dto.request.ChangePasswordRequest;
import com.andikisha.auth.application.dto.request.LoginRequest;
import com.andikisha.auth.application.dto.request.RefreshTokenRequest;
import com.andikisha.auth.application.dto.request.RegisterRequest;
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
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.infrastructure.cache.RedisKeys;
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

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       RolePermissionRepository rolePermissionRepository,
                       JwtTokenProvider jwtTokenProvider,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       AuthEventPublisher eventPublisher,
                       StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.eventPublisher = eventPublisher;
        this.redisTemplate = redisTemplate;
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

        String passwordHash = passwordEncoder.encode(request.password());

        User user = User.create(tenantId, request.email(),
                request.phoneNumber(), passwordHash, Role.EMPLOYEE);
        user = userRepository.save(user);

        final User savedUser = user;
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(savedUser);
                }
            });
        }

        return generateTokenResponse(user);
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
            throw new InvalidCredentialsException();
        }

        user.changePassword(passwordEncoder.encode(request.newPassword()));
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
}