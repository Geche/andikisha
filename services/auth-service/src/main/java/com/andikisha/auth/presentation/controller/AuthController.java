package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.request.ChangePasswordRequest;
import com.andikisha.auth.application.dto.request.ChangeRoleRequest;
import com.andikisha.auth.application.dto.request.ForgotPasswordRequest;
import com.andikisha.auth.application.dto.request.LoginRequest;
import com.andikisha.auth.application.dto.request.RefreshTokenRequest;
import com.andikisha.auth.application.dto.request.RegisterRequest;
import com.andikisha.auth.application.dto.request.ResetPasswordRequest;
import com.andikisha.auth.application.dto.request.SetActiveRequest;
import com.andikisha.auth.application.dto.request.ProvisionEmployeeRequest;
import com.andikisha.auth.application.dto.response.AdminPasswordResetResponse;
import com.andikisha.auth.application.dto.response.ProvisionEmployeeResponse;
import com.andikisha.auth.application.dto.response.TokenResponse;
import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.domain.model.Role;
import com.andikisha.common.tenant.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Login, register, token management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user")
    public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public TokenResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Change password for current user")
    public void changePassword(Authentication authentication,
                               @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(UUID.fromString(authentication.getName()), request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Logout and revoke all refresh tokens")
    public void logout(Authentication authentication) {
        authService.logout(UUID.fromString(authentication.getName()));
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Request a password reset email")
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reset password using a one-time token from email")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public UserResponse me(Authentication authentication) {
        return authService.getUser(UUID.fromString(authentication.getName()));
    }

    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change a user's role (ADMIN only)")
    public UserResponse changeRole(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody ChangeRoleRequest request) {
        UUID changerId = UUID.fromString(authentication.getName());
        return authService.changeUserRole(changerId, userId, request);
    }

    @PatchMapping("/users/{userId}/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate or deactivate a user (ADMIN only; soft-delete via is_active)")
    public UserResponse setActive(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody SetActiveRequest request) {
        UUID changerId = UUID.fromString(authentication.getName());
        return authService.setUserActive(changerId, userId, request.active());
    }

    @PostMapping("/employees/provision")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Provision a user account for a bulk-uploaded employee — returns temp password")
    public ProvisionEmployeeResponse provisionEmployee(
            @RequestBody ProvisionEmployeeRequest request) {
        String tenantId = TenantContext.requireTenantId();
        return authService.provisionForActivation(
                tenantId, request.employeeId(), request.email(), request.phone());
    }

    @GetMapping("/users/by-employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Look up the auth user linked to a given employee record")
    public UserResponse getUserByEmployee(@PathVariable UUID employeeId) {
        return authService.getUserByEmployeeId(TenantContext.requireTenantId(), employeeId);
    }

    @PostMapping("/users/{userId}/admin-password-reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Admin-initiated password reset — returns temp password for hand-off to employee")
    public AdminPasswordResetResponse adminPasswordReset(
            Authentication authentication,
            @PathVariable UUID userId) {
        UUID performerId = UUID.fromString(authentication.getName());
        // Derive caller's role from Spring Security authorities to enforce the
        // HR_MANAGER-cannot-reset-ADMIN rule without a DB lookup.
        Role performerRole = authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .filter(r -> { try { Role.valueOf(r); return true; } catch (IllegalArgumentException e) { return false; } })
                .findFirst()
                .map(Role::valueOf)
                .orElse(Role.EMPLOYEE);
        return authService.adminPasswordReset(performerId, performerRole, userId);
    }
}