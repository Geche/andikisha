package com.andikisha.tenant.application.service;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.events.tenant.TenantReactivatedEvent;
import com.andikisha.events.tenant.TenantSuspendedEvent;
import com.andikisha.tenant.application.port.LicenceEventPublisher;
import com.andikisha.tenant.domain.exception.InvalidLicenceTransitionException;
import com.andikisha.tenant.domain.model.LicenceHistory;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.repository.LicenceHistoryRepository;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Owns the licence-status transition state machine.
 *
 * The transition table is the single source of truth for what licence
 * lifecycle changes are allowed. Any transition not in the table throws
 * {@link InvalidLicenceTransitionException}.
 *
 * Cache contract: every successful transition writes the new status to
 * Redis under {@code licence:status:{tenantId}} with a 60-second TTL so
 * that other services (gateway, write-protection aspects) see a coherent
 * view without hammering this service via gRPC.
 */
@Service
@Transactional(readOnly = true)
public class LicenceStateMachineService {

    private static final Logger log = LoggerFactory.getLogger(LicenceStateMachineService.class);
    private static final Duration CACHE_TTL = Duration.ofSeconds(60);
    private static final List<LicenceStatus> ACTIVE_LIKE_STATUSES = List.of(
            LicenceStatus.TRIAL, LicenceStatus.ACTIVE,
            LicenceStatus.GRACE_PERIOD, LicenceStatus.SUSPENDED);

    private static final Map<LicenceStatus, Set<LicenceStatus>> ALLOWED_TRANSITIONS = Map.of(
            LicenceStatus.TRIAL,        EnumSet.of(LicenceStatus.ACTIVE, LicenceStatus.CANCELLED),
            LicenceStatus.ACTIVE,       EnumSet.of(LicenceStatus.GRACE_PERIOD, LicenceStatus.SUSPENDED, LicenceStatus.CANCELLED),
            LicenceStatus.GRACE_PERIOD, EnumSet.of(LicenceStatus.ACTIVE, LicenceStatus.SUSPENDED, LicenceStatus.CANCELLED),
            LicenceStatus.SUSPENDED,    EnumSet.of(LicenceStatus.ACTIVE, LicenceStatus.EXPIRED, LicenceStatus.CANCELLED),
            LicenceStatus.EXPIRED,      EnumSet.of(LicenceStatus.CANCELLED),
            LicenceStatus.CANCELLED,    EnumSet.noneOf(LicenceStatus.class)
    );

    private final TenantLicenceRepository licenceRepository;
    private final LicenceHistoryRepository historyRepository;
    private final LicenceEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;

    public LicenceStateMachineService(TenantLicenceRepository licenceRepository,
                                      LicenceHistoryRepository historyRepository,
                                      LicenceEventPublisher eventPublisher,
                                      StringRedisTemplate redisTemplate) {
        this.licenceRepository = licenceRepository;
        this.historyRepository = historyRepository;
        this.eventPublisher = eventPublisher;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Transition a licence to a new status, recording history and updating cache.
     *
     * @return the updated licence
     * @throws ResourceNotFoundException        if the licence does not exist
     * @throws InvalidLicenceTransitionException if the transition is not allowed
     */
    @Transactional
    public TenantLicence transition(UUID licenceId,
                                    LicenceStatus targetStatus,
                                    String changedBy,
                                    String reason) {
        TenantLicence licence = licenceRepository.findById(licenceId)
                .orElseThrow(() -> new ResourceNotFoundException("TenantLicence", licenceId));
        return applyTransition(licence, targetStatus, changedBy, reason);
    }

    private TenantLicence applyTransition(TenantLicence licence,
                                          LicenceStatus targetStatus,
                                          String changedBy,
                                          String reason) {
        LicenceStatus current = licence.getStatus();
        if (current == targetStatus) {
            // Idempotent no-op — but still refresh the cache.
            writeStatusToCache(licence.getTenantId(), targetStatus);
            return licence;
        }

        Set<LicenceStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(targetStatus)) {
            throw new InvalidLicenceTransitionException(current, targetStatus);
        }

        // Record history BEFORE mutating the licence so that an audit row
        // is always written in the same transaction.
        LicenceHistory history = LicenceHistory.record(
                licence.getTenantId(),
                licence.getId(),
                current,
                targetStatus,
                changedBy,
                reason);
        historyRepository.save(history);

        licence.changeStatus(targetStatus);
        licence.setLastModifiedBy(changedBy);

        if (targetStatus == LicenceStatus.SUSPENDED) {
            licence.markSuspendedAt(LocalDateTime.now());
        } else if (targetStatus == LicenceStatus.ACTIVE) {
            licence.clearSuspendedAt();
        } else if (targetStatus == LicenceStatus.CANCELLED) {
            licence.setCancelledReason(reason);
        }

        TenantLicence saved = licenceRepository.save(licence);
        writeStatusToCache(saved.getTenantId(), targetStatus);

        log.info("Licence {} transitioned {} -> {} by {} (reason: {})",
                licence.getId(), current, targetStatus, changedBy, reason);

        return saved;
    }

    /**
     * Suspend the tenant's currently-active licence.
     *
     * Resolves the active-like licence (TRIAL/ACTIVE/GRACE_PERIOD), transitions
     * it to SUSPENDED and emits a {@link TenantSuspendedEvent} only after the
     * database transaction commits.
     */
    @Transactional
    public TenantLicence suspend(String tenantId, String reason, String suspendedBy) {
        TenantLicence licence = licenceRepository.findByTenantIdAndStatusIn(
                        tenantId,
                        List.of(LicenceStatus.TRIAL, LicenceStatus.ACTIVE, LicenceStatus.GRACE_PERIOD))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TenantLicence", "tenantId=" + tenantId));

        LicenceStatus previous = licence.getStatus();
        TenantLicence saved = applyTransition(licence, LicenceStatus.SUSPENDED, suspendedBy, reason);

        TenantSuspendedEvent event = new TenantSuspendedEvent(tenantId, suspendedBy, reason, previous);
        publishAfterCommit(() -> eventPublisher.publishTenantSuspended(event));
        return saved;
    }

    /**
     * Reactivate a suspended (or grace-period) licence.
     * The redundant cache delete has been removed — applyTransition() already
     * writes ACTIVE to Redis with a 60-second TTL.
     */
    @Transactional
    public TenantLicence reactivate(String tenantId, String reactivatedBy) {
        TenantLicence licence = licenceRepository.findByTenantIdAndStatusIn(
                        tenantId,
                        List.of(LicenceStatus.SUSPENDED, LicenceStatus.GRACE_PERIOD))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TenantLicence", "tenantId=" + tenantId));

        LicenceStatus previous = licence.getStatus();
        TenantLicence saved = applyTransition(licence, LicenceStatus.ACTIVE, reactivatedBy,
                "Tenant reactivated");

        TenantReactivatedEvent event = new TenantReactivatedEvent(tenantId, reactivatedBy, previous);
        publishAfterCommit(() -> eventPublisher.publishTenantReactivated(event));
        return saved;
    }

    /**
     * Seed the Redis cache with the initial status for a newly created licence.
     * Called by {@link LicencePlanService} after first licence persistence so
     * the gateway filter never sees a cache miss for a brand-new tenant.
     */
    public void seedCacheForNewLicence(String tenantId, LicenceStatus status) {
        writeStatusToCache(tenantId, status);
    }

    /**
     * Schedule event publication only after the current transaction successfully
     * commits. Prevents ghost events on rollback and ensures downstream consumers
     * only see published state.
     */
    private void publishAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            action.run();
                        }
                    });
        } else {
            action.run();
        }
    }

    /**
     * Look up the current licence for the tenant if any active-like licence exists.
     */
    public TenantLicence getCurrentLicenceOrThrow(String tenantId) {
        return licenceRepository.findByTenantIdAndStatusIn(tenantId, ACTIVE_LIKE_STATUSES)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TenantLicence", "tenantId=" + tenantId));
    }

    private void writeStatusToCache(String tenantId, LicenceStatus status) {
        try {
            redisTemplate.opsForValue().set(
                    RedisKeys.licenceStatus(tenantId), status.name(), CACHE_TTL);
        } catch (Exception ex) {
            // Cache write failure must not break the transaction — readers
            // will fall back to gRPC after the 60s TTL expires anyway.
            log.warn("Failed to update licence status cache for tenant {}: {}",
                    tenantId, ex.getMessage());
        }
    }
}
