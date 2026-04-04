package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.request.ChangePasswordRequest;
import com.andikisha.auth.application.dto.request.LoginRequest;
import com.andikisha.auth.application.dto.request.RefreshTokenRequest;
import com.andikisha.auth.application.dto.request.RegisterRequest;
import com.andikisha.auth.application.dto.response.TokenResponse;
import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public UserResponse me(Authentication authentication) {
        return authService.getUser(UUID.fromString(authentication.getName()));
    }
}