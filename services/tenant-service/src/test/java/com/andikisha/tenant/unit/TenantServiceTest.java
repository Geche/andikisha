package com.andikisha.tenant.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.tenant.application.dto.request.CreateTenantRequest;
import com.andikisha.tenant.application.dto.request.UpdateTenantRequest;
import com.andikisha.tenant.application.dto.response.TenantResponse;
import com.andikisha.tenant.application.mapper.TenantMapper;
import com.andikisha.tenant.application.port.TenantEventPublisher;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantServiceTest {

    @Mock private TenantRepository tenantRepository;
    @Mock private PlanRepository planRepository;
    @Mock private TenantMapper mapper;
    @Mock private TenantEventPublisher eventPublisher;

    @InjectMocks private TenantService tenantService;

    @Test
    void create_withValidRequest_createsTenantAndRegistersAfterCommitEvent() {
        var request = new CreateTenantRequest(
                "Acme Ltd", "KE", "KES",
                "admin@acme.co.ke", "+254722000001",
                "Starter"
        );

        Plan plan = mock(Plan.class);
        when(tenantRepository.existsByAdminEmail("admin@acme.co.ke")).thenReturn(false);
        when(tenantRepository.existsByCompanyNameAndCountry("Acme Ltd", "KE")).thenReturn(false);
        when(planRepository.findByNameAndTenantId("Starter", "SYSTEM"))
                .thenReturn(Optional.of(plan));
        when(tenantRepository.save(any(Tenant.class))).thenAnswer(inv -> inv.getArgument(0));

        var expectedResponse = new TenantResponse(
                UUID.randomUUID(), "Acme Ltd", "KE", "KES",
                null, null, null, "admin@acme.co.ke", "+254722000001",
                "TRIAL", "Starter", "STARTER", null,
                "MONTHLY", 28, LocalDateTime.now()
        );
        when(mapper.toResponse(any(Tenant.class))).thenReturn(expectedResponse);

        // Activate transaction sync for the test thread
        TransactionSynchronizationManager.initSynchronization();
        try {
            TenantResponse result = tenantService.create(request);

            assertThat(result.companyName()).isEqualTo("Acme Ltd");
            assertThat(result.status()).isEqualTo("TRIAL");
            // Event publisher is NOT called until afterCommit; within the transaction it should not be called yet
            verify(eventPublisher, never()).publishTenantCreated(any());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void create_withDuplicateEmail_throwsDuplicateException() {
        var request = new CreateTenantRequest(
                "Acme Ltd", "KE", "KES",
                "existing@acme.co.ke", "+254722000001",
                "Starter"
        );

        when(tenantRepository.existsByAdminEmail("existing@acme.co.ke")).thenReturn(true);

        assertThatThrownBy(() -> tenantService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("adminEmail");
    }

    @Test
    void create_withDuplicateCompanyName_throwsDuplicateException() {
        var request = new CreateTenantRequest(
                "Existing Company", "KE", "KES",
                "new@company.co.ke", "+254722000001",
                "Starter"
        );

        when(tenantRepository.existsByAdminEmail("new@company.co.ke")).thenReturn(false);
        when(tenantRepository.existsByCompanyNameAndCountry("Existing Company", "KE"))
                .thenReturn(true);

        assertThatThrownBy(() -> tenantService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("companyName");
    }

    @Test
    void create_withUnknownPlan_throwsBusinessRuleException() {
        var request = new CreateTenantRequest(
                "New Co", "KE", "KES", "ceo@new.co.ke", "+254722000002", "NonExistentPlan"
        );
        when(tenantRepository.existsByAdminEmail(any())).thenReturn(false);
        when(tenantRepository.existsByCompanyNameAndCountry(any(), any())).thenReturn(false);
        when(planRepository.findByNameAndTenantId("NonExistentPlan", "SYSTEM"))
                .thenReturn(Optional.empty());

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThatThrownBy(() -> tenantService.create(request))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Plan not found");
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void getById_whenTenantExists_returnsResponse() {
        UUID id = UUID.randomUUID();
        Tenant tenant = mock(Tenant.class);
        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.of(tenant));
        var response = new TenantResponse(id, "Co", "KE", "KES", null, null, null,
                "admin@co.ke", "+254722000003", "ACTIVE", "Starter", "STARTER",
                null, "MONTHLY", 28, LocalDateTime.now());
        when(mapper.toResponse(tenant)).thenReturn(response);

        TenantResponse result = tenantService.getById(id);

        assertThat(result.id()).isEqualTo(id);
    }

    @Test
    void getById_whenTenantNotFound_throwsTenantNotFoundException() {
        UUID id = UUID.randomUUID();
        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> tenantService.getById(id))
                .isInstanceOf(TenantNotFoundException.class);
    }

    @Test
    void update_withPartialPaySchedule_throwsBusinessRuleException() {
        UUID id = UUID.randomUUID();
        Tenant tenant = mock(Tenant.class);
        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.of(tenant));

        // Only payFrequency provided, payDay missing
        var request = new UpdateTenantRequest(null, null, null, null, "WEEKLY", null);

        assertThatThrownBy(() -> tenantService.update(id, request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("payFrequency and payDay must both be provided");
    }

    @Test
    void suspend_alreadySuspended_throwsBusinessRuleException() {
        UUID id = UUID.randomUUID();
        Tenant tenant = Tenant.create("Co", "KE", "KES", "a@b.ke", "+254722000004", mock(Plan.class));
        // Suspend once first
        tenant.suspend("initial reason");

        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.of(tenant));

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThatThrownBy(() -> tenantService.suspend(id, "second reason"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("already suspended");
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void changePlan_onCancelledTenant_throwsBusinessRuleException() {
        UUID id = UUID.randomUUID();
        Tenant tenant = Tenant.create("Co", "KE", "KES", "a@b.ke", "+254722000005", mock(Plan.class));
        tenant.cancel();

        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.of(tenant));

        Plan newPlan = mock(Plan.class);
        when(planRepository.findByNameAndTenantId("Professional", "SYSTEM"))
                .thenReturn(Optional.of(newPlan));

        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThatThrownBy(() -> tenantService.changePlan(id, "Professional"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("cancelled tenant");
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void isActive_activeStatus_returnsTrue() {
        UUID id = UUID.randomUUID();
        Tenant tenant = Tenant.create("Co", "KE", "KES", "a@b.ke", "+254722000006", mock(Plan.class));
        tenant.activate();
        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.of(tenant));

        assertThat(tenantService.isActive(id)).isTrue();
    }

    @Test
    void isActive_suspendedStatus_returnsFalse() {
        UUID id = UUID.randomUUID();
        Tenant tenant = Tenant.create("Co", "KE", "KES", "a@b.ke", "+254722000007", mock(Plan.class));
        tenant.suspend("non-payment");
        when(tenantRepository.findByIdAndTenantId(id, id.toString()))
                .thenReturn(Optional.of(tenant));

        assertThat(tenantService.isActive(id)).isFalse();
    }
}
