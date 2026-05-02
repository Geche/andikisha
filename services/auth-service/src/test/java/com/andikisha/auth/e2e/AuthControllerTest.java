package com.andikisha.auth.e2e;

import com.andikisha.auth.application.dto.response.TokenResponse;
import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.domain.exception.AccountLockedException;
import com.andikisha.auth.domain.exception.InvalidCredentialsException;
import com.andikisha.auth.domain.exception.TokenExpiredException;
import com.andikisha.auth.infrastructure.config.SecurityConfig;
import com.andikisha.auth.infrastructure.config.WebMvcConfig;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.auth.presentation.advice.AuthExceptionHandler;
import com.andikisha.auth.presentation.filter.JwtAuthenticationFilter;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(com.andikisha.auth.presentation.controller.AuthController.class)
@Import({AuthExceptionHandler.class, GlobalExceptionHandler.class, WebMvcConfig.class,
        SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean AuthService authService;
    @MockitoBean JwtTokenProvider jwtTokenProvider;

    // @EnableJpaAuditing on the application class requires JpaMetamodelMappingContext
    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private static final String BASE      = "/api/v1/auth";
    private static final String TENANT_ID = "e2e-tenant";
    private static final UUID   USER_ID   = UUID.fromString("00000000-0000-0000-0000-000000000001");

    // ------------------------------------------------------------------
    // POST /register
    // ------------------------------------------------------------------

    @Test
    void register_withValidBody_returns201() throws Exception {
        TokenResponse tokenResponse = tokenResponse();
        when(authService.register(any())).thenReturn(tokenResponse);

        mockMvc.perform(post(BASE + "/register")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "jane@example.com",
                                  "phoneNumber": "+254700000001",
                                  "password": "SecurePass1"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void register_withInvalidBody_returns400() throws Exception {
        mockMvc.perform(post(BASE + "/register")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "not-an-email",
                                  "phoneNumber": "123",
                                  "password": "short"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    void register_withDuplicateEmail_returns409() throws Exception {
        when(authService.register(any()))
                .thenThrow(new DuplicateResourceException("User", "email", "jane@example.com"));

        mockMvc.perform(post(BASE + "/register")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "jane@example.com",
                                  "phoneNumber": "+254700000001",
                                  "password": "SecurePass1"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("DUPLICATE_RESOURCE"));
    }

    // ------------------------------------------------------------------
    // POST /login
    // ------------------------------------------------------------------

    @Test
    void login_withValidCredentials_returns200() throws Exception {
        when(authService.login(any())).thenReturn(tokenResponse());

        mockMvc.perform(post(BASE + "/login")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "jane@example.com", "password": "SecurePass1"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void login_withWrongCredentials_returns401() throws Exception {
        when(authService.login(any())).thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post(BASE + "/login")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "jane@example.com", "password": "wrong"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
    }

    @Test
    void login_withLockedAccount_returns429() throws Exception {
        when(authService.login(any()))
                .thenThrow(new AccountLockedException("Account temporarily locked"));

        mockMvc.perform(post(BASE + "/login")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "jane@example.com", "password": "SecurePass1"}
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("ACCOUNT_LOCKED"));
    }

    // ------------------------------------------------------------------
    // POST /refresh
    // ------------------------------------------------------------------

    @Test
    void refresh_withValidToken_returns200() throws Exception {
        when(authService.refresh(any())).thenReturn(tokenResponse());

        mockMvc.perform(post(BASE + "/refresh")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken": "valid-refresh-token"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void refresh_withExpiredToken_returns401() throws Exception {
        when(authService.refresh(any())).thenThrow(new TokenExpiredException());

        mockMvc.perform(post(BASE + "/refresh")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken": "expired-token"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("TOKEN_EXPIRED"));
    }

    // ------------------------------------------------------------------
    // POST /change-password (requires auth)
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    void changePassword_withCorrectCurrentPassword_returns204() throws Exception {
        mockMvc.perform(post(BASE + "/change-password")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword": "OldPass1", "newPassword": "NewPass1"}
                                """))
                .andExpect(status().isNoContent());

        verify(authService).changePassword(eq(USER_ID), any());
    }

    @Test
    void changePassword_withoutAuth_returns401() throws Exception {
        mockMvc.perform(post(BASE + "/change-password")
                        .header("X-Tenant-ID", TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword": "OldPass1", "newPassword": "NewPass1"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    // ------------------------------------------------------------------
    // POST /logout (requires auth)
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    void logout_whenAuthenticated_returns204() throws Exception {
        mockMvc.perform(post(BASE + "/logout")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isNoContent());

        verify(authService).logout(USER_ID);
    }

    @Test
    void logout_withoutAuth_returns401() throws Exception {
        mockMvc.perform(post(BASE + "/logout")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isUnauthorized());
    }

    // ------------------------------------------------------------------
    // GET /me (requires auth)
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    void me_whenAuthenticated_returns200() throws Exception {
        UserResponse userResponse = new UserResponse(
                USER_ID, TENANT_ID, "jane@example.com",
                "+254700000001", "EMPLOYEE", null, true, null, LocalDateTime.now());
        when(authService.getUser(USER_ID)).thenReturn(userResponse);

        mockMvc.perform(get(BASE + "/me")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void me_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get(BASE + "/me")
                        .header("X-Tenant-ID", TENANT_ID))
                .andExpect(status().isUnauthorized());
    }

    // ------------------------------------------------------------------
    // Missing tenant header
    // ------------------------------------------------------------------

    @Test
    void anyEndpoint_missingTenantHeader_returns400() throws Exception {
        when(authService.login(any())).thenReturn(tokenResponse());

        mockMvc.perform(post(BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "jane@example.com", "password": "SecurePass1"}
                                """))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private TokenResponse tokenResponse() {
        UserResponse userResponse = new UserResponse(
                USER_ID, TENANT_ID, "jane@example.com",
                "+254700000001", "EMPLOYEE", null, true, null, LocalDateTime.now());
        return new TokenResponse("access-token", "refresh-token", 3600L, userResponse);
    }
}
