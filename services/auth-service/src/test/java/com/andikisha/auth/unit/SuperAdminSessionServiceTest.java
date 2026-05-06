package com.andikisha.auth.unit;

import com.andikisha.auth.application.service.SuperAdminAuthService;
import com.andikisha.auth.domain.model.SuperAdminSession;
import com.andikisha.auth.domain.repository.SuperAdminSessionRepository;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SuperAdminSessionServiceTest {

    @Mock UserRepository userRepository;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock PasswordEncoder passwordEncoder;
    @Mock SuperAdminSessionRepository sessionRepository;
    @InjectMocks SuperAdminAuthService superAdminAuthService;

    @Test
    void listActiveSessions_returnsMappedResponses() {
        UUID adminUserId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        var session = SuperAdminSession.builder()
            .id(sessionId)
            .adminUserId(adminUserId)
            .expiresAt(Instant.now().plusSeconds(3600))
            .ipAddress("127.0.0.1")
            .build();
        when(sessionRepository.findByAdminUserIdAndRevokedAtIsNull(adminUserId))
            .thenReturn(List.of(session));

        var result = superAdminAuthService.listActiveSessions(adminUserId, sessionId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).current()).isTrue();
    }

    @Test
    void revokeSession_setsRevokedAt_andSaves() {
        var id = UUID.randomUUID();
        var session = SuperAdminSession.builder()
            .id(id)
            .revokedAt(null)
            .expiresAt(Instant.now().plusSeconds(3600))
            .build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));

        superAdminAuthService.revokeSession(id);

        assertThat(session.getRevokedAt()).isNotNull();
        verify(sessionRepository).save(session);
    }
}
