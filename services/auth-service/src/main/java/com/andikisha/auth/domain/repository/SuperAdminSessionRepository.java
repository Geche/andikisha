package com.andikisha.auth.domain.repository;

import com.andikisha.auth.domain.model.SuperAdminSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SuperAdminSessionRepository extends JpaRepository<SuperAdminSession, UUID> {
    List<SuperAdminSession> findByAdminUserIdAndRevokedAtIsNullAndExpiresAtAfter(UUID adminUserId, Instant now);
}
