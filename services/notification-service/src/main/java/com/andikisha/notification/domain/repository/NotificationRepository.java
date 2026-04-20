package com.andikisha.notification.domain.repository;

import com.andikisha.notification.domain.model.Notification;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Optional<Notification> findByIdAndTenantId(UUID id, String tenantId);

    Page<Notification> findByTenantIdAndRecipientIdOrderByCreatedAtDesc(
            String tenantId, UUID recipientId, Pageable pageable);

    Page<Notification> findByTenantIdOrderByCreatedAtDesc(
            String tenantId, Pageable pageable);

    /**
     * Finds RETRYING notifications (standard retry) plus PENDING or SENDING
     * notifications older than staleThreshold (stuck due to crash or race condition).
     */
    @Query("SELECT n FROM Notification n WHERE " +
           "n.status = com.andikisha.notification.domain.model.NotificationStatus.RETRYING OR " +
           "(n.status IN (com.andikisha.notification.domain.model.NotificationStatus.PENDING, " +
           "              com.andikisha.notification.domain.model.NotificationStatus.SENDING) " +
           " AND n.createdAt < :staleThreshold) " +
           "ORDER BY n.createdAt ASC")
    List<Notification> findRetryableNotifications(
            @Param("staleThreshold") LocalDateTime staleThreshold, Pageable pageable);

    boolean existsByTenantIdAndSourceEventIdAndChannel(
            String tenantId, String sourceEventId, NotificationChannel channel);

    List<Notification> findByTenantIdAndRecipientIdAndStatusOrderByCreatedAtDesc(
            String tenantId, UUID recipientId, NotificationStatus status);

    long countByTenantIdAndRecipientIdAndStatus(
            String tenantId, UUID recipientId, NotificationStatus status);
}
