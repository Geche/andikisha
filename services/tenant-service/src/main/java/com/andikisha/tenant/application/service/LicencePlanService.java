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
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

        LicenceRenewedEvent renewedEvent = new LicenceRenewedEvent(
                tenantId, saved.getId().toString(), newPlan.getName(),
                newEndDate, agreedPriceKes, billingCycle, renewedBy);
        publishAfterCommit(() -> eventPublisher.publishLicenceRenewed(renewedEvent));

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

        LicenceUpgradedEvent upgradedEvent = new LicenceUpgradedEvent(
                tenantId, saved.getId().toString(),
                previousPlanName, newPlan.getName(),
                newSeatCount, newAgreedPriceKes, upgradedBy);
        publishAfterCommit(() -> eventPublisher.publishLicenceUpgraded(upgradedEvent));

        writePlanTierToCache(tenantId, newPlan.getName());

        log.info("Upgraded licence {} for tenant {} {} -> {}",
                saved.getId(), tenantId, previousPlanName, newPlan.getName());
        return saved;
    }

    /**
     * Batch-load current active-ish licences for the supplied tenant IDs and
     * return a map keyed by tenantId. Used by SUPER_ADMIN list endpoints to
     * avoid an N+1 query per page.
     */
    public Map<String, LicenceResponse> batchGetCurrentLicences(List<String> tenantIds) {
        if (tenantIds == null || tenantIds.isEmpty()) {
            return Map.of();
        }
        List<TenantLicence> licences = licenceRepository.findByTenantIdInAndStatusIn(tenantIds, ACTIVE_LIKE);
        if (licences.isEmpty()) {
            return Map.of();
        }
        // Pre-fetch all needed plans in one query to avoid N+1 per licence.
        Set<UUID> planIds = licences.stream()
                .map(TenantLicence::getPlanId)
                .collect(Collectors.toSet());
        Map<UUID, Plan> planById = planRepository.findAllById(planIds).stream()
                .collect(Collectors.toMap(Plan::getId, p -> p, (a, b) -> a));

        return licences.stream()
                .collect(Collectors.toMap(
                        TenantLicence::getTenantId,
                        l -> toResponse(l, planById),
                        (a, b) -> a));
    }

    /**
     * Extend the current TRIAL licence's endDate by additionalDays so that
     * TenantLicence.endDate stays in sync with Tenant.trialEndsAt after a
     * SUPER_ADMIN trial extension (TENANT-BACKLOG-003 fix).
     *
     * No-op if the tenant has no active TRIAL licence (defensive).
     */
    @Transactional
    public void extendCurrentLicenceEndDate(String tenantId, int additionalDays, String updatedBy) {
        licenceRepository.findByTenantIdAndStatusIn(tenantId, List.of(LicenceStatus.TRIAL))
                .ifPresent(licence -> {
                    LocalDate current = licence.getEndDate() != null
                            ? licence.getEndDate()
                            : LocalDate.now(ZoneOffset.UTC);
                    licence.setEndDate(current.plusDays(additionalDays));
                    licence.setLastModifiedBy(updatedBy);
                    licenceRepository.save(licence);
                });
    }

    /**
     * Get the current active-ish licence as a response DTO.
     * noRollbackFor: ResourceNotFoundException is an expected outcome when a tenant has no
     * active licence (e.g. CANCELLED). Without this, catching the exception in a caller
     * that shares the transaction still leaves the transaction marked rollback-only, causing
     * UnexpectedRollbackException. Callers that need null-safe behaviour use safeGetCurrentLicence.
     */
    @Transactional(readOnly = true, noRollbackFor = ResourceNotFoundException.class)
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
     * Replaces the original findAll() + in-heap aggregation with targeted SQL
     * aggregation queries so this method is O(1) in DB round-trips regardless
     * of tenant volume.
     *
     * MRR computation:
     *   MONTHLY licence -> agreedPriceKes
     *   ANNUAL licence  -> agreedPriceKes / 12
     */
    public SuperAdminAnalyticsResponse getSuperAdminAnalytics() {
        // Single query: counts and MRR per status across all licences.
        Map<LicenceStatus, long[]>       statusCounts = new HashMap<>();
        Map<LicenceStatus, BigDecimal>   statusMrr    = new HashMap<>();
        for (Object[] row : licenceRepository.aggregateCountAndMrrByStatus()) {
            LicenceStatus s   = (LicenceStatus) row[0];
            long          cnt = ((Number) row[1]).longValue();
            BigDecimal    mrr = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            statusCounts.put(s, new long[]{cnt});
            statusMrr.put(s, mrr);
        }

        long active    = countFromMap(statusCounts, LicenceStatus.ACTIVE);
        long trial     = countFromMap(statusCounts, LicenceStatus.TRIAL);
        long suspended = countFromMap(statusCounts, LicenceStatus.SUSPENDED);
        long expired   = countFromMap(statusCounts, LicenceStatus.EXPIRED);
        long cancelled = countFromMap(statusCounts, LicenceStatus.CANCELLED);

        BigDecimal mrr = statusMrr.getOrDefault(LicenceStatus.ACTIVE, BigDecimal.ZERO)
                .add(statusMrr.getOrDefault(LicenceStatus.GRACE_PERIOD, BigDecimal.ZERO));
        BigDecimal arr = mrr.multiply(MONTHS_PER_YEAR).setScale(4, RoundingMode.HALF_UP);

        // Single query: per-plan counts, MRR, and seat totals for revenue-bearing statuses.
        List<LicenceStatus> revenueStatuses = List.of(
                LicenceStatus.ACTIVE, LicenceStatus.TRIAL, LicenceStatus.GRACE_PERIOD);
        List<Object[]> planRows = licenceRepository.aggregatePlanBreakdown(revenueStatuses);

        // Collect distinct planIds from results and fetch names in one query.
        Set<UUID> planIds = planRows.stream()
                .map(r -> (UUID) r[0])
                .collect(Collectors.toSet());
        Map<UUID, String> planNames = planRepository.findAllById(planIds).stream()
                .collect(Collectors.toMap(Plan::getId, Plan::getName, (a, b) -> a));

        long totalSeats = 0;
        Map<String, long[]>       planCounts = new HashMap<>();
        Map<String, BigDecimal>   planMrr    = new HashMap<>();
        for (Object[] row : planRows) {
            UUID   planId    = (UUID) row[0];
            long   cnt       = ((Number) row[1]).longValue();
            BigDecimal rowMrr = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            long   seats     = ((Number) row[3]).longValue();
            String name      = planNames.getOrDefault(planId, "unknown");
            planCounts.computeIfAbsent(name, k -> new long[]{0})[0] += cnt;
            planMrr.merge(name, rowMrr, BigDecimal::add);
            totalSeats += seats;
        }
        List<PlanBreakdown> breakdown = planCounts.entrySet().stream()
                .map(e -> new PlanBreakdown(
                        e.getKey(),
                        e.getValue()[0],
                        planMrr.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                .toList();

        // Two targeted count queries replace stream aggregation over the full table.
        LocalDate      firstOfMonth    = LocalDate.now().withDayOfMonth(1);
        LocalDateTime  firstOfMonthDt  = firstOfMonth.atStartOfDay();
        long newThisMonth    = licenceRepository.countDistinctTenantsStartedSince(firstOfMonth);
        long churnsThisMonth = licenceRepository.countDistinctChurnedSince(
                List.of(LicenceStatus.CANCELLED, LicenceStatus.EXPIRED), firstOfMonthDt);

        return new SuperAdminAnalyticsResponse(
                active, trial, suspended, expired, cancelled,
                mrr, arr, totalSeats,
                /* totalSeatsUsed not yet wired — requires employee-service */ 0L,
                breakdown, newThisMonth, churnsThisMonth);
    }

    private long countFromMap(Map<LicenceStatus, long[]> map, LicenceStatus status) {
        long[] arr = map.get(status);
        return arr != null ? arr[0] : 0L;
    }

    private void writePlanTierToCache(String tenantId, String planName) {
        try {
            redisTemplate.opsForValue().set(
                    RedisKeys.tenantPlanTier(tenantId), planName, PLAN_TIER_CACHE_TTL);
        } catch (Exception ex) {
            log.warn("Failed to write plan tier cache for tenant {}: {}", tenantId, ex.getMessage());
        }
    }

    /** Single-licence context: tolerated single-row plan lookup. */
    public LicenceResponse toResponse(TenantLicence licence) {
        Plan plan = planRepository.findById(licence.getPlanId()).orElse(null);
        return buildLicenceResponse(licence, plan != null ? plan.getName() : null);
    }

    /**
     * Batch context: caller supplies a pre-fetched planId → Plan map so that
     * plan resolution costs O(1) per licence instead of a DB round-trip each.
     */
    LicenceResponse toResponse(TenantLicence licence, Map<UUID, Plan> planById) {
        Plan plan = planById.get(licence.getPlanId());
        return buildLicenceResponse(licence, plan != null ? plan.getName() : null);
    }

    private LicenceResponse buildLicenceResponse(TenantLicence licence, String planName) {
        return new LicenceResponse(
                licence.getId(),
                licence.getTenantId(),
                licence.getPlanId(),
                planName,
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

        // Collect the IDs we actually need, then fetch only those rows.
        Set<UUID>   neededPlanIds   = expiring.stream().map(TenantLicence::getPlanId).collect(Collectors.toSet());
        List<String> neededTenantIds = expiring.stream().map(TenantLicence::getTenantId).distinct().toList();

        Map<UUID, String> planNames = planRepository.findAllById(neededPlanIds).stream()
                .collect(Collectors.toMap(Plan::getId, Plan::getName, (a, b) -> a));

        Map<String, Tenant> tenants = tenantRepository.findByTenantIdIn(neededTenantIds).stream()
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
