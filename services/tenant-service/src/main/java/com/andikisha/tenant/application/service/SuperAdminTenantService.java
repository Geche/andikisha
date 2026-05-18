package com.andikisha.tenant.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.dto.request.CreateTenantWithLicenceRequest;
import com.andikisha.tenant.application.dto.response.DashboardMetricsResponse;
import com.andikisha.tenant.application.dto.response.LicenceResponse;
import com.andikisha.tenant.application.dto.response.ProvisionedTenantResponse;
import com.andikisha.tenant.application.dto.response.TenantDetailResponse;
import com.andikisha.tenant.application.dto.response.TenantGrowthPointResponse;
import com.andikisha.tenant.application.dto.response.TenantSummaryResponse;
import com.andikisha.tenant.application.port.AuthServiceClient;
import com.andikisha.tenant.application.port.TenantEventPublisher;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.model.TenantStatus;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Orchestrates the SUPER_ADMIN tenant-provisioning workflow.
 * The provisioning is intentionally implemented as one transactional
 * sequence in this service rather than spread across the existing
 * {@link com.andikisha.tenant.application.service.TenantService} so that
 * licence + tenant rows are committed atomically. Auth Service enrolment
 * happens AFTER the DB commit (best-effort) — the temporary password is
 * returned to the caller out-of-band.
 */
@Service
@Transactional(readOnly = true)
public class SuperAdminTenantService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminTenantService.class);
    private static final String DEFAULT_COUNTRY = "KE";
    private static final String DEFAULT_CURRENCY = "KES";

    private final TenantRepository tenantRepository;
    private final PlanRepository planRepository;
    private final LicencePlanService licencePlanService;
    private final AuthServiceClient authServiceClient;
    private final TenantEventPublisher tenantEventPublisher;
    private final PasswordGenerator passwordGenerator;

    public SuperAdminTenantService(TenantRepository tenantRepository,
                                   PlanRepository planRepository,
                                   LicencePlanService licencePlanService,
                                   AuthServiceClient authServiceClient,
                                   TenantEventPublisher tenantEventPublisher,
                                   PasswordGenerator passwordGenerator) {
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.licencePlanService = licencePlanService;
        this.authServiceClient = authServiceClient;
        this.tenantEventPublisher = tenantEventPublisher;
        this.passwordGenerator = passwordGenerator;
    }

    @Transactional
    public ProvisionedTenantResponse createTenantWithLicence(CreateTenantWithLicenceRequest request,
                                                             String createdBy) {
        String normalizedEmail = request.adminEmail().toLowerCase(Locale.ROOT).trim();

        if (tenantRepository.existsByAdminEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Tenant", "adminEmail", normalizedEmail);
        }
        if (tenantRepository.existsByCompanyNameAndCountry(
                request.organisationName(), DEFAULT_COUNTRY)) {
            throw new DuplicateResourceException(
                    "Tenant", "companyName", request.organisationName());
        }

        Plan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan", request.planId()));
        if (!plan.isActive()) {
            throw new BusinessRuleException("INVALID_PLAN", "Plan is not active: " + plan.getName());
        }

        // 1. Create the tenant aggregate.
        Tenant tenant = Tenant.create(
                request.organisationName(), DEFAULT_COUNTRY, DEFAULT_CURRENCY,
                normalizedEmail, request.adminPhone(), plan);
        Tenant savedTenant = tenantRepository.save(tenant);

        // 2. Create the initial licence row in the same transaction.
        TenantLicence licence = licencePlanService.createInitialLicence(
                savedTenant.getTenantId(),
                request.planId(),
                request.billingCycle(),
                request.seatCount(),
                request.agreedPriceKes(),
                request.trialDays(),
                createdBy);

        // 3. Generate a one-time admin password — cryptographically random,
        //    shareable over a secure channel.
        String temporaryPassword = passwordGenerator.generate();

        // 4. Provision admin user in Auth Service via gRPC.
        //    Failure propagates and triggers @Transactional rollback of the tenant + licence rows.
        //    The super-admin sees the error and can retry the entire tenant creation flow.
        authServiceClient.provisionInitialAdmin(
                savedTenant.getTenantId(),
                normalizedEmail,
                request.adminFirstName(),
                request.adminLastName(),
                request.adminPhone(),
                temporaryPassword);

        // 5. Publish tenant.created so downstream services can provision schemas, etc.
        //    Deferred to afterCommit so a transaction rollback never produces ghost events.
        publishAfterCommit(() -> tenantEventPublisher.publishTenantCreated(savedTenant));

        return new ProvisionedTenantResponse(
                savedTenant.getId(),
                savedTenant.getCompanyName(),
                licence.getLicenceKey(),
                licence.getStatus(),
                plan.getName(),
                savedTenant.getAdminEmail(),
                temporaryPassword,
                licence.getSeatCount(),
                licence.getEndDate());
    }

    public Page<TenantSummaryResponse> listTenants(Pageable pageable) {
        Page<Tenant> tenantPage = tenantRepository.findAll(pageable);
        Map<String, LicenceResponse> licences = batchLoadLicences(tenantPage);
        return tenantPage.map(t -> toSummaryWithLicence(t, licences.get(t.getTenantId())));
    }

    public TenantDetailResponse getTenantDetail(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        LicenceResponse currentLicence = safeGetCurrentLicence(tenant.getTenantId());
        return new TenantDetailResponse(
                tenant.getId(),
                tenant.getCompanyName(),
                tenant.getStatus().name(),
                tenant.getCreatedAt(),
                tenant.getAdminEmail(),
                tenant.getAdminPhone(),
                tenant.getKraPin(),
                tenant.getNssfNumber(),
                tenant.getShifNumber(),
                tenant.getPayFrequency(),
                tenant.getPayDay(),
                tenant.getSuspensionReason(),
                tenant.getTrialEndsAt(),
                currentLicence);
    }

    private LicenceResponse safeGetCurrentLicence(String tenantId) {
        try {
            return licencePlanService.getCurrentLicence(tenantId);
        } catch (ResourceNotFoundException ex) {
            return null;
        }
    }

    private Map<String, LicenceResponse> batchLoadLicences(Page<Tenant> tenantPage) {
        List<String> tenantIds = tenantPage.map(Tenant::getTenantId).toList();
        return licencePlanService.batchGetCurrentLicences(tenantIds);
    }

    private TenantSummaryResponse toSummaryWithLicence(Tenant tenant, LicenceResponse licence) {
        return new TenantSummaryResponse(
                tenant.getId(),
                tenant.getCompanyName(),
                tenant.getStatus().name(),
                licence != null ? licence.planName() : tenant.getPlan().getName(),
                licence != null ? licence.seatCount() : null,
                licence != null ? licence.endDate() : null,
                tenant.getAdminEmail(),
                tenant.getCreatedAt());
    }

    @Transactional
    public TenantSummaryResponse extendTrial(UUID tenantId, int additionalDays, String updatedBy) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        tenant.extendTrial(additionalDays);
        Tenant saved = tenantRepository.save(tenant);
        LicenceResponse licence = safeGetCurrentLicence(saved.getTenantId());
        return toSummaryWithLicence(saved, licence);
    }

    @Transactional
    public void cancelTenant(UUID tenantId, String updatedBy) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        if (tenant.getStatus() == TenantStatus.CANCELLED) {
            throw new BusinessRuleException("INVALID_STATE", "Tenant is already cancelled");
        }
        tenant.cancel();
        tenantRepository.save(tenant);
        log.info("Tenant {} cancelled by {}", tenantId, updatedBy);
        String tenantIdStr = tenant.getTenantId();
        publishAfterCommit(() -> tenantEventPublisher.publishTenantCancelled(tenantIdStr, updatedBy));
    }

    public Page<TenantSummaryResponse> filterTenants(List<TenantStatus> statuses, Pageable pageable) {
        if (statuses == null || statuses.isEmpty()) {
            return listTenants(pageable);
        }
        Page<Tenant> tenantPage = tenantRepository.findByStatusIn(statuses, pageable);
        Map<String, LicenceResponse> licences = batchLoadLicences(tenantPage);
        return tenantPage.map(t -> toSummaryWithLicence(t, licences.get(t.getTenantId())));
    }

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
     * KPI counts for the SUPER_ADMIN dashboard. All counts are platform-wide
     * and intentionally bypass per-tenant filtering.
     * <p>
     * Note: {@code trialEndsAt} is a {@link LocalDate} (no time component),
     * so the "expiring in 48 hours" bucket is approximated as
     * "trial end date is today through today+2 inclusive". The "in 7 days"
     * bucket is "today through today+7 inclusive".
     */
    public DashboardMetricsResponse getDashboardMetrics() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate in7Days = today.plusDays(7);
        LocalDate in2Days = today.plusDays(2);
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        long total = tenantRepository.count();
        long active = tenantRepository.countByStatus(TenantStatus.ACTIVE);
        long suspended = tenantRepository.countByStatus(TenantStatus.SUSPENDED);
        long trialsExpiring7 = tenantRepository.countByStatusAndTrialEndsAtBetween(
                TenantStatus.TRIAL, today, in7Days);
        long trialsExpiring48 = tenantRepository.countByStatusAndTrialEndsAtBetween(
                TenantStatus.TRIAL, today, in2Days);
        long tenantDelta = tenantRepository.countByCreatedAtAfter(startOfMonth);
        long activeDelta = tenantRepository.countByStatusAndCreatedAtAfter(
                TenantStatus.ACTIVE, startOfMonth);

        return new DashboardMetricsResponse(
                total, active, trialsExpiring7, trialsExpiring48,
                suspended, tenantDelta, activeDelta);
    }

    /**
     * Returns monthly tenant signup counts plus active-tenant counts for the
     * requested period, grouped by calendar month. Empty months are omitted —
     * the caller (frontend) is responsible for filling gaps if a continuous
     * series is required.
     * <p>
     * Note: the underlying query always groups by month, so sub-month periods
     * ("24h", "7d", "30d") will still return one row per calendar month that
     * contains any activity in the window.
     */
    public List<TenantGrowthPointResponse> getTenantGrowth(String period) {
        long days = switch (period) {
            case "24h" -> 1;
            case "7d"  -> 7;
            case "30d" -> 30;
            case "3m"  -> 90;
            default    -> 365; // "12m" or unknown
        };
        LocalDateTime start = LocalDateTime.now(ZoneOffset.UTC).minusDays(days);
        return tenantRepository.findMonthlyGrowth(start).stream()
                .map(row -> new TenantGrowthPointResponse(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()))
                .toList();
    }
}
