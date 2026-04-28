package com.andikisha.auth.unit;

import com.andikisha.auth.application.dto.request.UssdSessionRequest;
import com.andikisha.auth.application.dto.response.UssdSessionResponse;
import com.andikisha.auth.application.service.UssdAuthService;
import com.andikisha.auth.domain.model.UssdSession;
import com.andikisha.auth.domain.repository.UssdSessionRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.exception.BusinessRuleException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UssdAuthServiceTest {

    @Mock private UssdSessionRepository ussdSessionRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private PasswordEncoder passwordEncoder;

    private UssdAuthService service;

    private static final String MSISDN = "254712345678";
    private static final String PIN = "1234";
    private static final String HASHED_PIN = "$2a$hash";
    private static final String TENANT_ID = "tenant-abc";
    private static final String EMPLOYEE_ID = "emp-1";
    private static final String TOKEN = "ussd.jwt.token";

    @BeforeEach
    void setUp() {
        service = new UssdAuthService(ussdSessionRepository, jwtTokenProvider, passwordEncoder);
    }

    private UssdSession activeSession(LocalDateTime expiresAt) {
        return UssdSession.create(TENANT_ID, EMPLOYEE_ID, HASHED_PIN, MSISDN, expiresAt);
    }

    // ── Happy path ────────────────────────────────────────────────────────────

    @Test
    void validPinAndActiveSession_returnsToken() {
        UssdSession session = activeSession(LocalDateTime.now().plusMinutes(5));
        when(ussdSessionRepository.findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc(MSISDN))
                .thenReturn(Optional.of(session));
        when(passwordEncoder.matches(PIN, HASHED_PIN)).thenReturn(true);
        when(jwtTokenProvider.generateUssdToken(anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(TOKEN);
        when(ussdSessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UssdSessionResponse response = service.validateAndIssueToken(
                new UssdSessionRequest(MSISDN, PIN));

        assertThat(response.sessionToken()).isEqualTo(TOKEN);
        assertThat(response.expiresAt()).isNotNull();
        assertThat(session.isUsed()).isTrue();
        verify(ussdSessionRepository).save(session);
    }

    // ── No active session ─────────────────────────────────────────────────────

    @Test
    void noActiveSession_throwsBusinessRuleException() {
        when(ussdSessionRepository.findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc(MSISDN))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.validateAndIssueToken(new UssdSessionRequest(MSISDN, PIN)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid PIN or no active session");
    }

    // ── Expired session ───────────────────────────────────────────────────────

    @Test
    void expiredSession_throwsBusinessRuleException() {
        UssdSession session = activeSession(LocalDateTime.now().minusMinutes(1));
        when(ussdSessionRepository.findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc(MSISDN))
                .thenReturn(Optional.of(session));

        assertThatThrownBy(() ->
                service.validateAndIssueToken(new UssdSessionRequest(MSISDN, PIN)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("expired");
    }

    // ── Wrong PIN ─────────────────────────────────────────────────────────────

    @Test
    void wrongPin_throwsBusinessRuleException() {
        UssdSession session = activeSession(LocalDateTime.now().plusMinutes(5));
        when(ussdSessionRepository.findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc(MSISDN))
                .thenReturn(Optional.of(session));
        when(passwordEncoder.matches("wrong", HASHED_PIN)).thenReturn(false);

        assertThatThrownBy(() ->
                service.validateAndIssueToken(new UssdSessionRequest(MSISDN, "wrong")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid PIN");
    }
}
