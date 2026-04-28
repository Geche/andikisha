package com.andikisha.tenant.unit;

import com.andikisha.common.domain.model.BillingCycle;
import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.port.LicenceEventPublisher;
import com.andikisha.tenant.application.service.LicenceStateMachineService;
import com.andikisha.tenant.domain.exception.InvalidLicenceTransitionException;
import com.andikisha.tenant.domain.model.LicenceHistory;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.repository.LicenceHistoryRepository;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LicenceStateMachineServiceTest {

    @Mock private TenantLicenceRepository licenceRepository;
    @Mock private LicenceHistoryRepository historyRepository;
    @Mock private LicenceEventPublisher eventPublisher;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    private LicenceStateMachineService service;

    private static final String TENANT_ID = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        service = new LicenceStateMachineService(
                licenceRepository, historyRepository, eventPublisher, redisTemplate);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    private TenantLicence buildLicence(LicenceStatus status) {
        TenantLicence licence = TenantLicence.create(
                TENANT_ID, UUID.randomUUID(), BillingCycle.MONTHLY, 10,
                BigDecimal.valueOf(10000),
                LocalDate.now().minusMonths(1),
                LocalDate.now().plusMonths(11),
                status,
                "tester");
        // Force an id so transition() can resolve it.
        try {
            Field idField = licence.getClass().getSuperclass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(licence, UUID.randomUUID());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        lenient().when(licenceRepository.findById(licence.getId())).thenReturn(Optional.of(licence));
        lenient().when(licenceRepository.save(any(TenantLicence.class))).thenAnswer(inv -> inv.getArgument(0));
        return licence;
    }

    private void assertValidTransition(LicenceStatus from, LicenceStatus to) {
        TenantLicence licence = buildLicence(from);
        TenantLicence result = service.transition(licence.getId(), to, "actor", "reason");
        assertThat(result.getStatus()).isEqualTo(to);
        verify(historyRepository).save(any(LicenceHistory.class));
    }

    private void assertInvalidTransition(LicenceStatus from, LicenceStatus to) {
        TenantLicence licence = buildLicence(from);
        assertThatThrownBy(() -> service.transition(licence.getId(), to, "actor", "reason"))
                .isInstanceOf(InvalidLicenceTransitionException.class);
    }

    // ---------- valid transitions (10 tests) ----------

    @Test void trial_to_active_isAllowed()        { assertValidTransition(LicenceStatus.TRIAL, LicenceStatus.ACTIVE); }
    @Test void trial_to_cancelled_isAllowed()     { assertValidTransition(LicenceStatus.TRIAL, LicenceStatus.CANCELLED); }
    @Test void active_to_grace_isAllowed()        { assertValidTransition(LicenceStatus.ACTIVE, LicenceStatus.GRACE_PERIOD); }
    @Test void active_to_cancelled_isAllowed()    { assertValidTransition(LicenceStatus.ACTIVE, LicenceStatus.CANCELLED); }
    @Test void grace_to_active_isAllowed()        { assertValidTransition(LicenceStatus.GRACE_PERIOD, LicenceStatus.ACTIVE); }
    @Test void grace_to_suspended_isAllowed()     { assertValidTransition(LicenceStatus.GRACE_PERIOD, LicenceStatus.SUSPENDED); }
    @Test void grace_to_cancelled_isAllowed()     { assertValidTransition(LicenceStatus.GRACE_PERIOD, LicenceStatus.CANCELLED); }
    @Test void suspended_to_active_isAllowed()    { assertValidTransition(LicenceStatus.SUSPENDED, LicenceStatus.ACTIVE); }
    @Test void suspended_to_expired_isAllowed()   { assertValidTransition(LicenceStatus.SUSPENDED, LicenceStatus.EXPIRED); }
    @Test void suspended_to_cancelled_isAllowed() { assertValidTransition(LicenceStatus.SUSPENDED, LicenceStatus.CANCELLED); }

    // ---------- invalid transitions (5 tests) ----------

    @Test void expired_to_active_isRejected()     { assertInvalidTransition(LicenceStatus.EXPIRED, LicenceStatus.ACTIVE); }
    @Test void cancelled_to_active_isRejected()   { assertInvalidTransition(LicenceStatus.CANCELLED, LicenceStatus.ACTIVE); }
    @Test void trial_to_suspended_isRejected()    { assertInvalidTransition(LicenceStatus.TRIAL, LicenceStatus.SUSPENDED); }
    @Test void active_to_expired_isRejected()     { assertInvalidTransition(LicenceStatus.ACTIVE, LicenceStatus.EXPIRED); }
    @Test void expired_to_grace_isRejected()      { assertInvalidTransition(LicenceStatus.EXPIRED, LicenceStatus.GRACE_PERIOD); }

    // ---------- side-effects ----------

    @Test
    void transitionToSuspended_setsSuspendedAt() {
        TenantLicence licence = buildLicence(LicenceStatus.GRACE_PERIOD);
        TenantLicence updated = service.transition(licence.getId(), LicenceStatus.SUSPENDED,
                "actor", "missed payment");
        assertThat(updated.getSuspendedAt()).isNotNull();
    }

    @Test
    void transitionFromSuspendedToActive_clearsSuspendedAt() {
        TenantLicence licence = buildLicence(LicenceStatus.SUSPENDED);
        licence.markSuspendedAt(java.time.LocalDateTime.now().minusDays(1));
        TenantLicence updated = service.transition(licence.getId(), LicenceStatus.ACTIVE,
                "actor", "payment received");
        assertThat(updated.getSuspendedAt()).isNull();
    }

    @Test
    void transitionToCancelled_setsCancelledReason() {
        TenantLicence licence = buildLicence(LicenceStatus.ACTIVE);
        TenantLicence updated = service.transition(licence.getId(), LicenceStatus.CANCELLED,
                "actor", "customer churn");
        assertThat(updated.getCancelledReason()).isEqualTo("customer churn");
    }

    @Test
    void transition_writesAuditHistory_inOrder() {
        TenantLicence licence = buildLicence(LicenceStatus.ACTIVE);
        service.transition(licence.getId(), LicenceStatus.GRACE_PERIOD, "actor", "expired");

        ArgumentCaptor<LicenceHistory> historyCaptor = ArgumentCaptor.forClass(LicenceHistory.class);
        verify(historyRepository).save(historyCaptor.capture());

        LicenceHistory written = historyCaptor.getValue();
        assertThat(written.getPreviousStatus()).isEqualTo(LicenceStatus.ACTIVE);
        assertThat(written.getNewStatus()).isEqualTo(LicenceStatus.GRACE_PERIOD);
        assertThat(written.getChangedBy()).isEqualTo("actor");
        assertThat(written.getChangeReason()).isEqualTo("expired");
    }

    @Test
    void transition_writesStatusToRedisCache() {
        TenantLicence licence = buildLicence(LicenceStatus.ACTIVE);
        service.transition(licence.getId(), LicenceStatus.GRACE_PERIOD, "actor", "reason");
        verify(valueOperations).set(any(), any(), any());
    }

    @Test
    void transition_unknownLicence_throwsResourceNotFound() {
        UUID missingId = UUID.randomUUID();
        when(licenceRepository.findById(missingId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.transition(missingId, LicenceStatus.ACTIVE, "x", "y"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void suspend_loadsActiveLicence_andTransitions() {
        TenantLicence licence = buildLicence(LicenceStatus.ACTIVE);
        when(licenceRepository.findByTenantIdAndStatusIn(any(), any()))
                .thenReturn(Optional.of(licence));

        TenantLicence result = service.suspend(TENANT_ID, "non-payment", "admin");
        assertThat(result.getStatus()).isEqualTo(LicenceStatus.SUSPENDED);
        verify(eventPublisher).publishTenantSuspended(any());
    }

    @Test
    void reactivate_transitionsAndPublishesEvent() {
        TenantLicence licence = buildLicence(LicenceStatus.SUSPENDED);
        when(licenceRepository.findByTenantIdAndStatusIn(any(), any()))
                .thenReturn(Optional.of(licence));

        TenantLicence result = service.reactivate(TENANT_ID, "admin");
        assertThat(result.getStatus()).isEqualTo(LicenceStatus.ACTIVE);
        verify(eventPublisher).publishTenantReactivated(any());
    }
}
