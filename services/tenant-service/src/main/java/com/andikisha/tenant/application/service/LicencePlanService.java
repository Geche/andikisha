package com.andikisha.tenant.application.service;

import com.andikisha.common.domain.model.BillingCycle;
import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.events.tenant.LicenceRenewedEvent;
import com.andikisha.events.tenant.LicenceUpgradedEvent;
import com.andikisha.tenant.application.dto.response.LicenceHistoryResponse;
import com.andikisha.tenant.application.dto.response.LicenceResponse;
import com.andikisha.tenant.application.dto.response.PlanBreakdown;
import com.andikisha.tenant.application.dto.response.SuperAdminAnalyticsResponse;
import com.andikisha.tenant.application.port.LicenceEventPublisher;
import com.andikisha.tenant.application.dto.response.ExpiringLicenceResponse;
import com.andikisha.tenant.domain.model.LicenceHistory;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.repository.LicenceHistoryRepository;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import com.andikisha.tenant.domain.repository.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Application service for licence lifecycle operations that span more than
 * just a state transition: creation, renewal, plan upgrades, and
 * super-admin analytics aggregation.
 *
 * State changes ultimately delegate to {@link LicenceStateMachineService}
 * so the transition map is enforced consistently.
 */
@Service
@Transactional(readOnly = true)
public class LicencePlanService {

    private static final Logger log = LoggerFactory.getLogger(LicencePlanService.class);
    private static final BigDecimal MONTHS_PER_YEAR = BigDecimal.valueOf(12);
    private static final Duration PLAN_TIER_CACHE_TTL = Duration.ofHours(24);
    private static final List<LicenceStatus> ACTIVE_LIKE = List.of(
            LicenceStatus.TRIAL, LicenceStatus.ACTIVE, LicenceStatus.GRACE_PERIOD);

    private final TenantLicenceRepository licenceRepository;
    private final LicenceHistoryRepository historyRepository;
    private final PlanRepository planRepository;
    private final TenantRepository tenantRepository;
    private final LicenceEventPublisher eventPublisher;
    private final LicenceStateMachineService stateMachine;
    private final StringRedisTemplate redisTemplate;

    public LicencePlanService(TenantLicenceRepository licenceRepository,
                              LicenceHistoryRepository historyRepository,
                              PlanRepository planRepository,
                              TenantRepository tenantRepository,
                              LicenceEventPublisher eventPublisher,
                              LicenceStateMachineService stateMachine,
                              StringRedisTemplate redisTemplate) {
        this.licenceRepository = licenceRepository;
        this.historyRepository = historyRepository;
        this.planRepository = planRepository;
        this.tenantRepository = tenantRepository;
        this.eventPublisher = eventPublisher;
        this.stateMachine = stateMachine;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Create the very first licence for a freshly-provisioned tenant.
     *
     * If {@code trialDays > 0}, the licence is created in TRIAL status and
     * expires after {@code trialDays} days. Otherwise the licence is ACTIVE
     * and runs for 12 months from today (annual billing default for new sales).
     *
     * Per LicenceHistory's NOT NULL constraint on previous_status, the very
     * first row uses {@code previousStatus == newStatus} as the audit-trail
     * representation of "null -> status".
     */
    @Transactional
    public TenantLicence createInitialLicence(String tenantId,
                                              UUID planId,
                                              BillingCycle billingCycle,
                                              int seatCount,
                                              BigDecimal agreedPriceKes,
                                              int trialDays,
                                              String createdBy) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", planId));

        LocalDate today = LocalDate.now();
        LicenceStatus status;
        LocalDate endDate;
        if (trialDays > 0) {
            status = LicenceStatus.TRIAL;
            endDate = today.plusDays(trialDays);
        } else {
            status = LicenceStatus.ACTIVE;
            endDate = today.plusMonths(12);
        }

        TenantLicence licence = TenantLicence.create(
                tenantId, plan.getId(), billingCycle, seatCount,
                agreedPriceKes, today, endDate, status, createdBy);
        TenantLicence saved = licenceRepository.save(licence);

        // Initial creation: record an audit row representing "null -> status".
        LicenceHistory history = LicenceHistory.record(
                tenantId, saved.getId(), status, status, createdBy,
                "Initial licence creation");
        historyRepository.save(history);

        // Seed the gateway cache so TenantLicenceFilter sees the correct status
        // immediately — before the first state transition fires.
        stateMachine.seedCacheForNewLicence(tenantId, status);
        writePlanTierToCache(tenantId, plan.getName());

        log.info("Created initial licence {} for tenant {} status={} planId={}",
                saved.getId(), tenantId, status, plan.getId());
        return saved;
    }

    /**
     * Renew an existing licence by superseding it with a new row.
     *
     * Renewal semantics: the old licence is left in ACTIVE status (its
     * end_date already passed or is about to) and a new licence is
     * created carrying the new dates / price / plan. The old licence's
     * supersession is recorded in {@code licence_history} with reason
     * "Renewal — superseded".
     */
    @Transactional
    public TenantLicence renew(String tenantId,
                               UUID newPlanId,
                               BillingCycle billingCycle,
                               int seatCount,
                               BigDecimal agreedPriceKes,
                               LocalDate newEndDate,
                               String renewedBy) {
        TenantLicence current = licenceRepository.findByTenantIdAndStatusIn(tenantId, ACTIVE_LIKE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TenantLicence", "tenantId=" + tenantId));

        Plan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", newPlanId));

        // Record supersession of the old licence in history (no status change).
        historyRepository.save(LicenceHistory.record(
                tenantId, current.getId(), current.getStatus(), current.getStatus(),
                renewedBy, "Renewal — superseded"));

        // Create the replacement licence row.
        LocalDate today = LocalDate.now();
        TenantLicence renewed = TenantLicence.create(
                tenantId, newPlan.getId(), billingCycle, seatCount,
                agreedPriceKes, today, newEndDate, LicenceStatus.ACTIVE, renewedBy);
        TenantLicence saved = licenceRepository.save(renewed);

        historyRepository.save(LicenceHistory.record(
                tenantId, saved.getId(), LicenceStatus.ACTIVE, LicenceStatus.ACTIVE,
                renewedBy, "Licence renewed"));

        eventPublisher.publishLicenceRenewed(new LicenceRenewedEvent(
                tenantId, saved.getId().toString(), newPlan.getName(),
                newEndDate, agreedPriceKes, billingCycle, renewedBy));

        log.info("Renewed licence for tenant {}: old={} new={} endDate={}",
                tenantId, current.getId(), saved.getId(), newEndDate);
        return saved;
    }

    /**
     * Upgrade (or change) the plan/seats/price of the current licence
     * in-place. Status must be TRIAL or ACTIVE; downgrades from
     * GRACE_PERIOD/SUSPENDED are not permitted by this path.
     */
    @Transactional
    public TenantLicence upgrade(String tenantId,
                                 UUID newPlanId,
                                 int newSeatCount,
                                 BigDecimal newAgreedPriceKes,
                                 String upgradedBy) {
        TenantLicence current = licenceRepository.findByTenantIdAndStatusIn(
                        tenantId, List.of(LicenceStatus.TRIAL, LicenceStatus.ACTIVE))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TenantLicence", "tenantId=" + tenantId));

        if (current.getStatus() != LicenceStatus.ACTIVE
                && current.getStatus() != LicenceStatus.TRIAL) {
            throw new BusinessRuleException("INVALID_LICENCE_STATE",
                    "Plan upgrade requires ACTIVE or TRIAL licence; current=" + current.getStatus());
        }

        Plan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", newPlanId));
        Plan previousPlan = planRepository.findById(current.getPlanId())
                .orElse(null);
        String previousPlanName = previousPlan != null ? previousPlan.getName() : "unknown";

        current.setPlanId(newPlan.getId());
        current.setSeatCount(newSeatCount);
        current.setAgreedPriceKes(newAgreedPriceKes);
        current.setLastModifiedBy(upgradedBy);

        TenantLicence saved = licenceRepository.save(current);

        historyRepository.save(LicenceHistory.record(
                tenantId, saved.getId(), saved.getStatus(), saved.getStatus(),
                upgradedBy, "Plan upgrade"));

        eventPublisher.publishLicenceUpgraded(new LicenceUpgradedEvent(
                tenantId, saved.getId().toString(),
                previousPlanName, newPlan.getName(),
                newSeatCount, newAgreedPriceKes, upgradedBy));

        writePlanTierToCache(tenantId, newPlan.getName());

        log.info("Upgraded licence {} for tenant {} {} -> {}",
                saved.getId(), tenantId, previousPlanName, newPlan.getName());
        return saved;
    }

    /**
     * Get the current active-ish licence as a response DTO.
     */
    public LicenceResponse getCurrentLicence(String tenantId) {
        TenantLicence licence = licenceRepository.findByTenantIdAndStatusIn(tenantId,
                        List.of(LicenceStatus.TRIAL, LicenceStatus.ACTIVE,
                                LicenceStatus.GRACE_PERIOD, LicenceStatus.SUSPENDED))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "TenantLicence", "tenantId=" + tenantId));
        return toResponse(licence);
    }

    public List<LicenceHistoryResponse> getHistoryForTenant(String tenantId) {
        return historyRepository.findByTenantIdOrderByChangedAtDesc(tenantId)
                .stream()
                .map(h -> new LicenceHistoryResponse(
                        h.getId(), h.getTenantId(), h.getLicenceId(),
                        h.getPreviousStatus(), h.getNewStatus(),
                        h.getChangedBy(), h.getChangeReason(), h.getChangedAt()))
                .toList();
    }

    /**
     * Aggregate platform-wide subscription metrics for the SUPER_ADMIN dashboard.
     *
     * MRR computation:
     *   MONTHLY licence -> agreedPriceKes
     *   ANNUAL licence  -> agreedPriceKes / 12
     */
    public SuperAdminAnalyticsResponse getSuperAdminAnalytics() {
        List<TenantLicence> all = licenceRepository.findAll();

        long active     = countByStatus(all, LicenceStatus.ACTIVE);
        long trial      = countByStatus(all, LicenceStatus.TRIAL);
        long suspended  = countByStatus(all, LicenceStatus.SUSPENDED);
        long expired    = countByStatus(all, LicenceStatus.EXPIRED);
        long cancelled  = countByStatus(all, LicenceStatus.CANCELLED);

        BigDecimal mrr = all.stream()
                .filter(l -> l.getStatus() == LicenceStatus.ACTIVE
                          || l.getStatus() == LicenceStatus.GRACE_PERIOD)
                .map(this::monthlyRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal arr = mrr.multiply(MONTHS_PER_YEAR);

        long totalSeats = all.stream()
                .filter(l -> l.getStatus() == LicenceStatus.ACTIVE
                          || l.getStatus() == LicenceStatus.TRIAL
                          || l.getStatus() == LicenceStatus.GRACE_PERIOD)
                .mapToLong(TenantLicence::getSeatCount)
                .sum();

        // Map planId -> Plan once to avoid N+1 lookups.
        Map<UUID, Plan> planById = planRepository.findAll().stream()
                .collect(Collectors.toMap(Plan::getId, p -> p, (a, b) -> a));

        Map<String, long[]> planCounts = new HashMap<>();
        Map<String, BigDecimal> planMrr = new HashMap<>();
        for (TenantLicence licence : all) {
            if (licence.getStatus() != LicenceStatus.ACTIVE
                    && licence.getStatus() != LicenceStatus.GRACE_PERIOD) {
                continue;
            }
            Plan plan = planById.get(licence.getPlanId());
            String planName = plan != null ? plan.getName() : "unknown";
            planCounts.computeIfAbsent(planName, k -> new long[]{0})[0]++;
            planMrr.merge(planName, monthlyRevenue(licence), BigDecimal::add);
        }
        List<PlanBreakdown> breakdown = planCounts.entrySet().stream()
                .map(e -> new PlanBreakdown(
                        e.getKey(),
                        e.getValue()[0],
                        planMrr.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                .toList();

        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        long newThisMonth = all.stream()
                .filter(l -> l.getStartDate() != null
                        && !l.getStartDate().isBefore(firstOfMonth))
                .map(TenantLicence::getTenantId)
                .distinct()
                .count();
        long churnsThisMonth = all.stream()
                .filter(l -> l.getStatus() == LicenceStatus.CANCELLED
                          || l.getStatus() == LicenceStatus.EXPIRED)
                .filter(l -> l.getUpdatedAt() != null
                        && !l.getUpdatedAt().toLocalDate().isBefore(firstOfMonth))
                .map(TenantLicence::getTenantId)
                .distinct()
                .count();

        return new SuperAdminAnalyticsResponse(
                active, trial, suspended, expired, cancelled,
                mrr, arr, totalSeats,
                /* totalSeatsUsed not yet wired — requires employee-service */ 0L,
                breakdown, newThisMonth, churnsThisMonth);
    }

    private BigDecimal monthlyRevenue(TenantLicence licence) {
        BigDecimal price = licence.getAgreedPriceKes();
        if (price == null) return BigDecimal.ZERO;
        return licence.getBillingCycle() == BillingCycle.ANNUAL
                ? price.divide(MONTHS_PER_YEAR, 4, RoundingMode.HALF_UP)
                : price;
    }

    private long countByStatus(List<TenantLicence> all, LicenceStatus status) {
        return all.stream().filter(l -> l.getStatus() == status).count();
    }

    private void writePlanTierToCache(String tenantId, String planName) {
        try {
            redisTemplate.opsForValue().set(
                    RedisKeys.tenantPlanTier(tenantId), planName, PLAN_TIER_CACHE_TTL);
        } catch (Exception ex) {
            log.warn("Failed to write plan tier cache for tenant {}: {}", tenantId, ex.getMessage());
        }
    }

    public LicenceResponse toResponse(TenantLicence licence) {
        Plan plan = planRepository.findById(licence.getPlanId()).orElse(null);
        return new LicenceResponse(
                licence.getId(),
                licence.getTenantId(),
                licence.getPlanId(),
                plan != null ? plan.getName() : null,
                licence.getLicenceKey(),
                licence.getBillingCycle(),
                licence.getSeatCount(),
                licence.getAgreedPriceKes(),
                licence.getCurrency(),
                licence.getStartDate(),
                licence.getEndDate(),
                licence.getStatus(),
                licence.getSuspendedAt(),
                licence.getCreatedBy()
        );
    }

    /**
     * Find licences expiring within {@code daysAhead} and map them to response
     * DTOs enriched with tenant and plan names. Delegated from the controller
     * so that all business logic (date arithmetic, cross-repository lookups,
     * stream aggregation) lives in the application layer.
     */
    public List<ExpiringLicenceResponse> getExpiringLicences(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(daysAhead);
        
        List<TenantLicence> expiring = licenceRepository
                .findByStatusInAndEndDateBetween(
                        List.of(LicenceStatus.TRIAL, LicenceStatus.ACTIVE,
                                LicenceStatus.GRACE_PERIOD),
                        today, end);

        // Short-circuit empty result — no need for lookups.
        if (expiring.isEmpty()) {
            return List.of();
        }

        // Build plan-id → plan-name lookup once.
        Map<UUID, String> planNames = planRepository.findAll().stream()
                .collect(Collectors.toMap(Plan::getId, Plan::getName, (a, b) -> a));

        // Build tenant-id → tenant lookup once.
        Map<String, Tenant> tenants = tenantRepository.findAll().stream()
                .collect(Collectors.toMap(Tenant::getTenantId, t -> t, (a, b) -> a));

        return expiring.stream()
                .map(licence -> {
                    Tenant t = tenants.get(licence.getTenantId());
                    long days = java.time.temporal.ChronoUnit.DAYS.between(today, licence.getEndDate());
                    return new ExpiringLicenceResponse(
                            t != null ? t.getId() : null,
                            t != null ? t.getCompanyName() : null,
                            planNames.getOrDefault(licence.getPlanId(), "unknown"),
                            licence.getEndDate(),
                            days,
                            licence.getSeatCount(),
                            licence.getAgreedPriceKes(),
                            t != null ? t.getAdminEmail() : null);
                })
                .toList();
    }

    /**
     * Publish an event only after the current transaction completes successfully.
     * If there is no active transaction, publishes immediately.
     */
    void publishAfterCommit(Runnable publishAction) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            publishAction.run();
                        }
                    });
        } else {
            publishAction.run();
        }
    }
}
