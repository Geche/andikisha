package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.response.SuperAdminSessionResponse;
import com.andikisha.auth.application.service.SuperAdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/super-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminSessionController {

    private final SuperAdminAuthService superAdminAuthService;

    @GetMapping("/sessions")
    public ResponseEntity<List<SuperAdminSessionResponse>> listSessions(Authentication authentication) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(superAdminAuthService.listActiveSessions(adminUserId, null));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(@PathVariable UUID sessionId) {
        superAdminAuthService.revokeSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}
