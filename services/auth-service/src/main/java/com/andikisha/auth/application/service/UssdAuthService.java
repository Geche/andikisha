package com.andikisha.auth.application.service;

import com.andikisha.auth.application.dto.request.UssdSessionRequest;
import com.andikisha.auth.application.dto.response.UssdSessionResponse;
import com.andikisha.auth.domain.model.UssdSession;
import com.andikisha.auth.domain.repository.UssdSessionRepository;
import com.andikisha.auth.infrastructure.jwt.JwtTokenProvider;
import com.andikisha.common.exception.BusinessRuleException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class UssdAuthService {

    private static final long USSD_TOKEN_TTL_MS = 15 * 60 * 1000L; // 15 minutes

    private final UssdSessionRepository ussdSessionRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public UssdAuthService(UssdSessionRepository ussdSessionRepository,
                           JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder) {
        this.ussdSessionRepository = ussdSessionRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UssdSessionResponse validateAndIssueToken(UssdSessionRequest request) {
        UssdSession session = ussdSessionRepository
                .findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc(request.msisdn())
                .orElseThrow(() -> new BusinessRuleException("INVALID_USSD_PIN",
                        "Invalid PIN or no active session"));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("USSD_SESSION_EXPIRED", "USSD session has expired");
        }

        if (!passwordEncoder.matches(request.pin(), session.getPin())) {
            throw new BusinessRuleException("INVALID_USSD_PIN", "Invalid PIN");
        }

        // Mark the validated session as used, then invalidate any remaining
        // unused sessions for the same MSISDN to prevent concurrent valid tokens.
        session.markUsed();
        ussdSessionRepository.save(session);

        List<UssdSession> remaining = ussdSessionRepository.findByMsisdnAndUsedFalse(request.msisdn());
        for (UssdSession s : remaining) {
            s.markUsed();
            ussdSessionRepository.save(s);
        }

        Instant expiresAt = Instant.now().plusMillis(USSD_TOKEN_TTL_MS);
        String token = jwtTokenProvider.generateUssdToken(
                request.msisdn(),
                session.getTenantId(),
                session.getEmployeeId(),
                USSD_TOKEN_TTL_MS
        );

        return new UssdSessionResponse(token, expiresAt);
    }
}
