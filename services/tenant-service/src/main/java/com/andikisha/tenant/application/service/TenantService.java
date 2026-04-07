package com.andikisha.tenant.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.tenant.application.dto.request.CreateTenantRequest;
import com.andikisha.tenant.application.dto.request.UpdateTenantRequest;
import com.andikisha.tenant.application.dto.response.TenantResponse;
import com.andikisha.tenant.application.mapper.TenantMapper;
import com.andikisha.tenant.application.port.TenantEventPublisher;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TenantService {

    static final String SYSTEM_TENANT = "SYSTEM";

    private final TenantRepository tenantRepository;
    private final PlanRepository planRepository;
    private final TenantMapper mapper;
    private final TenantEventPublisher eventPublisher;

    public TenantService(TenantRepository tenantRepository,
                         PlanRepository planRepository,
                         TenantMapper mapper,
                         TenantEventPublisher eventPublisher) {
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public TenantResponse create(CreateTenantRequest request) {
        if (tenantRepository.existsByAdminEmail(request.adminEmail())) {
            throw new DuplicateResourceException("Tenant", "adminEmail", request.adminEmail());
        }
        if (tenantRepository.existsByCompanyNameAndCountry(
                request.companyName(), request.country())) {
            throw new DuplicateResourceException(
                    "Tenant", "companyName", request.companyName());
        }

        String planName = request.planName() != null ? request.planName() : "Starter";
        Plan plan = planRepository.findByNameAndTenantId(planName, SYSTEM_TENANT)
                .orElseThrow(() -> new BusinessRuleException(
                        "INVALID_PLAN", "Plan not found: " + planName));

        Tenant tenant = Tenant.create(
                request.companyName(),
                request.country(),
                request.currency(),
                request.adminEmail(),
                request.adminPhone(),
                plan
        );

        final Tenant savedTenant = tenantRepository.save(tenant);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                eventPublisher.publishTenantCreated(savedTenant);
            }
        });

        return mapper.toResponse(savedTenant);
    }

    public TenantResponse getById(UUID tenantId) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        return mapper.toResponse(tenant);
    }

    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public Page<TenantResponse> listAll(Pageable pageable) {
        return tenantRepository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional
    public TenantResponse update(UUID tenantId, UpdateTenantRequest request) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));

        if (request.companyName() != null) {
            tenant.updateCompanyName(request.companyName());
        }

        if (request.kraPin() != null || request.nssfNumber() != null
                || request.shifNumber() != null) {
            tenant.updateStatutoryRegistrations(
                    request.kraPin() != null ? request.kraPin() : tenant.getKraPin(),
                    request.nssfNumber() != null ? request.nssfNumber() : tenant.getNssfNumber(),
                    request.shifNumber() != null ? request.shifNumber() : tenant.getShifNumber()
            );
        }

        boolean hasFrequency = request.payFrequency() != null;
        boolean hasDay = request.payDay() != null;
        if (hasFrequency != hasDay) {
            throw new BusinessRuleException("INVALID_PAY_SCHEDULE",
                    "payFrequency and payDay must both be provided together");
        }
        if (hasFrequency) {
            tenant.updatePaySchedule(request.payFrequency(), request.payDay());
        }

        tenant = tenantRepository.save(tenant);
        return mapper.toResponse(tenant);
    }

    @Transactional
    public void suspend(UUID tenantId, String reason) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        tenant.suspend(reason);
        tenantRepository.save(tenant);
        String tenantIdStr = tenantId.toString();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                eventPublisher.publishTenantSuspended(tenantIdStr, reason);
            }
        });
    }

    @Transactional
    public void reactivate(UUID tenantId) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));
        tenant.reactivate();
        tenantRepository.save(tenant);
        String tenantIdStr = tenantId.toString();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                eventPublisher.publishTenantReactivated(tenantIdStr);
            }
        });
    }

    public boolean isActive(UUID tenantId) {
        return tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .map(t -> t.getStatus() == TenantStatus.ACTIVE
                        || (t.getStatus() == TenantStatus.TRIAL && !t.isTrialExpired()))
                .orElse(false);
    }

    @Transactional
    public TenantResponse changePlan(UUID tenantId, String newPlanName) {
        Tenant tenant = tenantRepository.findByIdAndTenantId(tenantId, tenantId.toString())
                .orElseThrow(() -> new TenantNotFoundException(tenantId));

        String oldPlanName = tenant.getPlan().getName();

        Plan newPlan = planRepository.findByNameAndTenantId(newPlanName, SYSTEM_TENANT)
                .orElseThrow(() -> new BusinessRuleException(
                        "INVALID_PLAN", "Plan not found: " + newPlanName));

        tenant.changePlan(newPlan);
        final Tenant savedTenant = tenantRepository.save(tenant);
        final String tenantIdStr = tenantId.toString();
        final String capturedOldPlan = oldPlanName;
        final String capturedNewPlan = newPlanName;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                eventPublisher.publishTenantPlanChanged(tenantIdStr, capturedOldPlan, capturedNewPlan);
            }
        });

        return mapper.toResponse(savedTenant);
    }
}
