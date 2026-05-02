package com.andikisha.tenant.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.dto.request.CreateTenantWithLicenceRequest;
import com.andikisha.tenant.application.dto.response.LicenceResponse;
import com.andikisha.tenant.application.dto.response.ProvisionedTenantResponse;
import com.andikisha.tenant.application.dto.response.TenantDetailResponse;
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

import java.util.List;
import java.util.Locale;
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

    public SuperAdminTenantService(TenantRepository tenantRepository,
                                   PlanRepository planRepository,
                                   LicencePlanService licencePlanService,
                                   AuthServiceClient authServiceClient,
                                   TenantEventPublisher tenantEventPublisher) {
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.licencePlanService = licencePlanService;
        this.authServiceClient = authServiceClient;
        this.tenantEventPublisher = tenantEventPublisher;
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

        // 3. Generate a one-time admin password. UUID-based so it's
        //    cryptographically random and trivially shareable over a secure channel.
        String temporaryPassword = generateTemporaryPassword();

        // 4. Provision admin user in Auth Service via gRPC.
        try {
            authServiceClient.provisionInitialAdmin(
                    savedTenant.getTenantId(),
                    normalizedEmail,
                    request.adminFirstName(),
                    request.adminLastName(),
                    request.adminPhone(),
                    temporaryPassword);
        } catch (Exception ex) {
            // Auth Service failure must not abort tenant creation — the
            // SUPER_ADMIN can resend the invite. Log and continue.
            log.error("Auth Service provisionInitialAdmin failed for tenant {} - manual fix required",
                    savedTenant.getTenantId(), ex);
        }

        // 5. Publish tenant.created so downstream services can provision schemas, etc.
        tenantEventPublisher.publishTenantCreated(savedTenant);

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
        return tenantRepository.findAll(pageable).map(this::toSummary);
    }

    public TenantDetailResponse getTenantDetail(UUID tenantId) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        LicenceResponse currentLicence = safeGetCurrentLicence(tenant.getTenantId());
        return new TenantDetailResponse(
                tenant.getId(),
                tenant.getCompanyName(),
                tenant.getStatus().name(),
                tenant.getCreatedAt(),
                currentLicence);
    }

    private LicenceResponse safeGetCurrentLicence(String tenantId) {
        try {
            return licencePlanService.getCurrentLicence(tenantId);
        } catch (ResourceNotFoundException ex) {
            return null;
        }
    }

    private TenantSummaryResponse toSummary(Tenant tenant) {
        LicenceResponse current = safeGetCurrentLicence(tenant.getTenantId());
        return new TenantSummaryResponse(
                tenant.getId(),
                tenant.getCompanyName(),
                tenant.getStatus().name(),
                current != null ? current.planName() : tenant.getPlan().getName(),
                current != null ? current.seatCount() : null,
                current != null ? current.endDate() : null,
                tenant.getAdminEmail(),
                tenant.getCreatedAt());
    }

    public Page<TenantSummaryResponse> filterTenants(List<TenantStatus> statuses, Pageable pageable) {
        if (statuses == null || statuses.isEmpty()) {
            return listTenants(pageable);
        }
        return tenantRepository.findByStatusIn(statuses, pageable).map(this::toSummary);
    }

    private static final String PASSWORD_CHARSET =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int PASSWORD_LENGTH = 20;
    private static final java.security.SecureRandom SECURE_RANDOM = new java.security.SecureRandom();

    /**
     * Generates a temporary password using a base62 charset via SecureRandom.
     * 20 characters gives ~119 bits of entropy (log2(62^20)).
     */
    static String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARSET.charAt(SECURE_RANDOM.nextInt(PASSWORD_CHARSET.length())));
        }
        return sb.toString();
    }

    @Transactional
    public void publishTenantCreatedEvent(Tenant tenant) {
        tenantEventPublisher.publishTenantCreated(tenant);
    }
}
