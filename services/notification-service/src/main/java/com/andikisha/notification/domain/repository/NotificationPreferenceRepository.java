package com.andikisha.notification.domain.repository;

import com.andikisha.notification.domain.model.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferenceRepository
        extends JpaRepository<NotificationPreference, UUID> {

    Optional<NotificationPreference> findByTenantIdAndUserIdAndCategory(
            String tenantId, UUID userId, String category);

    List<NotificationPreference> findByTenantIdAndUserId(
            String tenantId, UUID userId);
}