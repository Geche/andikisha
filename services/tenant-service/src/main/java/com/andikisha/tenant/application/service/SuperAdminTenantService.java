package com.andikisha.tenant.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.dto.request.CreateTenantWithLicenceRequest;
import com.andikisha.tenant.application.dto.response.AdminPasswordResetResponse;
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
    private final LicenceStateMachineService licenceStateMachine;
    private final AuthServiceClient authServiceClient;
    private final TenantEventPublisher tenantEventPublisher;
    private final PasswordGenerator passwordGenerator;
    private final SlugGeneratorService slugGeneratorService;

    public SuperAdminTenantService(TenantRepository tenantRepository,
                                   PlanRepository planRepository,
                                   LicencePlanService licencePlanService,
                                   LicenceStateMachineService licenceStateMachine,
                                   AuthServiceClient authServiceClient,
                                   TenantEventPublisher tenantEventPublisher,
                                   PasswordGenerator passwordGenerator,
                                   SlugGeneratorService slugGeneratorService) {
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.licencePlanService = licencePlanService;
        this.licenceStateMachine = licenceStateMachine;
        this.authServiceClient = authServiceClient;
        this.tenantEventPublisher = tenantEventPublisher;
        this.passwordGenerator = passwordGenerator;
        this.slugGeneratorService = slugGeneratorService;
    }

    private static final java.util.Set<String> CONSUMER_EMAIL_DOMAINS = java.util.Set.of(
            "gmail.com", "yahoo.com", "yahoo.co.ke", "hotmail.com", "outlook.com",
            "live.com", "icloud.com", "me.com", "protonmail.com", "aol.com"
    );

    @Transactional
    public ProvisionedTenantResponse createTenantWithLicence(CreateTenantWithLicenceRequest request,
                                                             String createdBy) {
        String normalizedEmail = request.adminEmail().toLowerCase(Locale.ROOT).trim();

        // Work-domain check: block consumer email domains unless explicitly bypassed.
        String emailDomain = normalizedEmail.contains("@")
                ? normalizedEmail.substring(normalizedEmail.indexOf('@') + 1)
                : "";
        if (CONSUMER_EMAIL_DOMAINS.contains(emailDomain)
                && !Boolean.TRUE.equals(request.bypassWorkEmailCheck())) {
            throw new BusinessRuleException("CONSUMER_EMAIL_DOMAIN",
                    "Admin email uses a personal domain (" + emailDomain + "). "
                    + "Use a work email address, or set bypassWorkEmailCheck=true to override.");
        }

        // Behavior A: same email is allowed across tenants (consultant-as-admin pattern).
        // The DB composite UNIQUE(admin_email, tenant_id) enforces within-tenant uniqueness.
        // No pre-creation email check needed — the new tenant gets a fresh UUID tenant_id.
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

        // 1. Generate (or validate and deduplicate) the workspace.
        String workspace = slugGeneratorService.generate(
                request.organisationName(), request.workspace());

        // 2. Check workspace uniqueness before creating tenant (gives a clear user-facing 409).
        if (tenantRepository.existsByWorkspace(workspace)) {
            throw new DuplicateResourceException("Tenant", "workspace", workspace);
        }

        // 3. Create the tenant aggregate.
        Tenant tenant = Tenant.create(
                request.organisationName(), DEFAULT_COUNTRY, DEFAULT_CURRENCY,
                normalizedEmail, request.adminPhone(), plan, workspace);
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
                savedTenant.getWorkspace(),
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
        // Cancelled tenants have no active licence — skip the fetch to avoid
        // poisoning the shared transaction via ResourceNotFoundException.
        LicenceResponse currentLicence = tenant.getStatus() == TenantStatus.CANCELLED
                ? null
                : safeGetCurrentLicence(tenant.getTenantId());
        return new TenantDetailResponse(
                tenant.getId(),
                tenant.getCompanyName(),
                tenant.getWorkspace(),
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
                tenant.getWorkspace(),
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
        // Update Tenant.trialEndsAt (used by dashboard metrics and expiry alerts).
        tenant.extendTrial(additionalDays);
        Tenant saved = tenantRepository.save(tenant);

        // Also update TenantLicence.endDate so the licence card and list page
        // show the same extended date. Both fields must move atomically (TENANT-BACKLOG-003).
        licencePlanService.extendCurrentLicenceEndDate(saved.getTenantId(), additionalDays, updatedBy);

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
        // Cancel the licence first — validates the transition and records LicenceHistory.
        // If the tenant has no cancellable licence (edge case: provisioning failed mid-way),
        // the state machine throws ResourceNotFoundException, which rolls back the transaction
        // and leaves the Tenant row unchanged. This is safer than silently leaving an orphaned
        // licence in ACTIVE/TRIAL state while the Tenant row says CANCELLED.
        licenceStateMachine.cancel(tenantId.toString(), updatedBy, "Tenant cancelled by SUPER_ADMIN");

        tenant.cancel();
        tenantRepository.save(tenant);
        log.info("Tenant {} cancelled by {}", tenantId, updatedBy);
        String tenantIdStr = tenant.getTenantId();
        publishAfterCommit(() -> tenantEventPublisher.publishTenantCancelled(tenantIdStr, updatedBy));
    }

    /**
     * Reset the tenant admin's password to a new cryptographically-random temporary
     * password and set must_change_password = true via the auth-service gRPC.
     *
     * The temporary password is returned in the response — the SUPER_ADMIN must
     * share it with the tenant admin via a secure out-of-band channel (phone, secure
     * message). It is not stored anywhere after this call.
     */
    @Transactional(readOnly = true)
    public AdminPasswordResetResponse resetAdminPassword(UUID tenantId, String requestedBy) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));

        String temporaryPassword = passwordGenerator.generate();
        authServiceClient.resetAdminPassword(
                tenant.getTenantId(),
                tenant.getAdminEmail(),
                temporaryPassword);

        log.info("Admin password reset for tenantId={} by {}", tenantId, requestedBy);
        return new AdminPasswordResetResponse(
                tenant.getTenantId(),
                tenant.getAdminEmail(),
                temporaryPassword);
    }

    public boolean isWorkspaceAvailable(String workspace) {
        return !tenantRepository.existsByWorkspace(workspace);
    }

    @Transactional
    public void updateWorkspace(UUID tenantId, String newWorkspace, String requestedBy) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));

        if (tenant.getWorkspace().equals(newWorkspace)) {
            throw new BusinessRuleException("Workspace is already set to '" + newWorkspace + "'");
        }
        if (tenantRepository.existsByWorkspace(newWorkspace)) {
            throw new DuplicateResourceException("Tenant", "workspace", newWorkspace);
        }

        tenant.updateWorkspace(newWorkspace);
        log.info("Workspace updated for tenantId={} to '{}' by {}", tenantId, newWorkspace, requestedBy);
    }

    /** Update the tenant's organisation-level statutory registrations (KRA PIN, NSSF, SHIF). */
    @Transactional
    public void updateStatutory(UUID tenantId, String kraPin, String nssfNumber,
                                String shifNumber, String requestedBy) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        tenant.updateStatutoryRegistrations(kraPin, nssfNumber, shifNumber);
        log.info("Statutory registrations updated for tenantId={} by {}", tenantId, requestedBy);
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
        LocalDate in14Days = today.plusDays(14);
        LocalDate in7Days = today.plusDays(7);
        LocalDate in2Days = today.plusDays(2);
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        long total = tenantRepository.count();
        long active = tenantRepository.countByStatus(TenantStatus.ACTIVE);
        long suspended = tenantRepository.countByStatus(TenantStatus.SUSPENDED);
        long trialsExpiring14 = tenantRepository.countByStatusAndTrialEndsAtBetween(
                TenantStatus.TRIAL, today, in14Days);
        long trialsExpiring7 = tenantRepository.countByStatusAndTrialEndsAtBetween(
                TenantStatus.TRIAL, today, in7Days);
        long trialsExpiring48 = tenantRepository.countByStatusAndTrialEndsAtBetween(
                TenantStatus.TRIAL, today, in2Days);
        long tenantDelta = tenantRepository.countByCreatedAtAfter(startOfMonth);
        long activeDelta = tenantRepository.countByStatusAndCreatedAtAfter(
                TenantStatus.ACTIVE, startOfMonth);

        return new DashboardMetricsResponse(
                total, active, trialsExpiring7, trialsExpiring48,
                trialsExpiring14, suspended, tenantDelta, activeDelta);
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
