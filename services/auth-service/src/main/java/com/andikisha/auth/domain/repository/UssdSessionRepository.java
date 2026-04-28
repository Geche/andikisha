package com.andikisha.auth.domain.repository;

import com.andikisha.auth.domain.model.UssdSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UssdSessionRepository extends JpaRepository<UssdSession, UUID> {

    Optional<UssdSession> findFirstByTenantIdAndMsisdnAndUsedFalseOrderByCreatedAtDesc(
            String tenantId, String msisdn);

    Optional<UssdSession> findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc(String msisdn);

    void deleteByExpiresAtBefore(LocalDateTime cutoff);

    List<UssdSession> findByMsisdnAndUsedFalse(String msisdn);
}
