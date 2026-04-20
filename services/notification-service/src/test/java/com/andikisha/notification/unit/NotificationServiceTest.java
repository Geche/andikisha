package com.andikisha.notification.unit;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.notification.application.mapper.NotificationMapper;
import com.andikisha.notification.application.service.NotificationDispatcher;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.Notification;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPreference;
import com.andikisha.notification.domain.model.NotificationPriority;
import com.andikisha.notification.domain.model.NotificationStatus;
import com.andikisha.notification.domain.repository.NotificationPreferenceRepository;
import com.andikisha.notification.domain.repository.NotificationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private static final String TENANT_ID    = "test-tenant";
    private static final UUID   RECIPIENT_ID = UUID.randomUUID();

    @Mock NotificationRepository repository;
    @Mock NotificationPreferenceRepository preferenceRepository;
    @Mock NotificationMapper mapper;
    @Mock NotificationDispatcher dispatcher;

    private NotificationService service;

    @BeforeEach
    void setUp() {
        service = new NotificationService(repository, preferenceRepository, mapper, dispatcher);
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // sendNotification — happy path
    // -------------------------------------------------------------------------

    @Test
    void sendNotification_savesAndDispatchesById() {
        stubSave();
        stubNoPreferenceOverride();

        service.sendNotification(TENANT_ID, RECIPIENT_ID, "Alice", "alice@co.ke", null,
                NotificationChannel.EMAIL, "PAYROLL", "Payslip Ready", "Your payslip is ready.",
                NotificationPriority.NORMAL, "evt-1", "PayrollProcessed");

        verify(repository).save(any(Notification.class));
        verify(dispatcher).dispatchAsync(any(UUID.class));
    }

    @Test
    void sendNotification_setsCorrectChannel() {
        stubSave();
        stubNoPreferenceOverride();

        service.sendNotification(TENANT_ID, RECIPIENT_ID, "Bob", null, "+254700000001",
                NotificationChannel.SMS, "LEAVE", "Leave Approved", "Your leave is approved.",
                NotificationPriority.HIGH, "evt-2", "LeaveApproved");

        verify(repository).save(argThat(n -> n.getChannel() == NotificationChannel.SMS));
    }

    // -------------------------------------------------------------------------
    // sendNotification — idempotency (I5)
    // -------------------------------------------------------------------------

    @Test
    void sendNotification_duplicateSourceEventId_skipped() {
        when(repository.existsByTenantIdAndSourceEventIdAndChannel(
                TENANT_ID, "evt-dup", NotificationChannel.EMAIL)).thenReturn(true);

        service.sendNotification(TENANT_ID, RECIPIENT_ID, "Alice", "alice@co.ke", null,
                NotificationChannel.EMAIL, "PAYROLL", "Sub", "Body",
                NotificationPriority.NORMAL, "evt-dup", "PayrollProcessed");

        verifyNoMoreInteractions(repository);
        verifyNoInteractions(dispatcher);
    }

    @Test
    void sendNotification_nullSourceEventId_noIdempotencyCheck() {
        stubSave();
        when(preferenceRepository.findByTenantIdAndUserIdAndCategory(any(), any(), any()))
                .thenReturn(Optional.empty());

        service.sendNotification(TENANT_ID, RECIPIENT_ID, "Alice", "alice@co.ke", null,
                NotificationChannel.EMAIL, "PAYROLL", "Sub", "Body",
                NotificationPriority.NORMAL, null, "PayrollProcessed");

        verify(repository, never()).existsByTenantIdAndSourceEventIdAndChannel(any(), any(), any());
        verify(dispatcher).dispatchAsync(any(UUID.class));
    }

    // -------------------------------------------------------------------------
    // sendNotification — preference check (I4)
    // -------------------------------------------------------------------------

    @Test
    void sendNotification_userOptedOutOfChannel_skipped() {
        when(repository.existsByTenantIdAndSourceEventIdAndChannel(any(), any(), any())).thenReturn(false);
        NotificationPreference pref = mockPreference(NotificationChannel.EMAIL, false);
        when(preferenceRepository.findByTenantIdAndUserIdAndCategory(TENANT_ID, RECIPIENT_ID, "PAYROLL"))
                .thenReturn(Optional.of(pref));

        service.sendNotification(TENANT_ID, RECIPIENT_ID, "Alice", "alice@co.ke", null,
                NotificationChannel.EMAIL, "PAYROLL", "Sub", "Body",
                NotificationPriority.NORMAL, "evt-pref", "PayrollProcessed");

        verify(repository, never()).save(any());
        verifyNoInteractions(dispatcher);
    }

    @Test
    void sendNotification_inAppAlwaysSent_ignoringEmailPreference() {
        stubSave();
        // IN_APP skips preference check entirely — no preferenceRepository call expected

        service.sendNotification(TENANT_ID, RECIPIENT_ID, "Alice", "alice@co.ke", null,
                NotificationChannel.IN_APP, "PAYROLL", "Sub", "Body",
                NotificationPriority.NORMAL, "evt-inapp", "PayrollProcessed");

        verifyNoInteractions(preferenceRepository);
        verify(dispatcher).dispatchAsync(any(UUID.class));
    }

    // -------------------------------------------------------------------------
    // sendMultiChannel
    // -------------------------------------------------------------------------

    @Test
    void sendMultiChannel_withEmailAndPhone_createsThreeNotifications() {
        stubSave();
        stubNoPreferenceOverride();

        service.sendMultiChannel(TENANT_ID, RECIPIENT_ID, "Carol", "carol@co.ke", "+254711111111",
                "PAYROLL", "Payslip", "Body", NotificationPriority.NORMAL, "evt-3", "PayrollProcessed");

        verify(repository, times(3)).save(any(Notification.class));
        verify(dispatcher, times(3)).dispatchAsync(any(UUID.class));
    }

    @Test
    void sendMultiChannel_withNoPhone_createsEmailAndInApp() {
        stubSave();
        stubNoPreferenceOverride();

        service.sendMultiChannel(TENANT_ID, RECIPIENT_ID, "Dave", "dave@co.ke", null,
                "LEAVE", "Leave Approved", "Approved.", NotificationPriority.HIGH, "evt-4", "Leave");

        verify(repository, times(2)).save(any(Notification.class));
        verify(dispatcher, times(2)).dispatchAsync(any(UUID.class));
    }

    // -------------------------------------------------------------------------
    // retryFailed (I3)
    // -------------------------------------------------------------------------

    @Test
    void retryFailed_dispatchesRetryingAndStaleNotifications() {
        Notification canRetry = makeNotification(NotificationStatus.RETRYING, 1);
        Notification exhausted = makeNotification(NotificationStatus.FAILED, 3);

        when(repository.findRetryableNotifications(any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of(canRetry, exhausted));

        service.retryFailed();

        verify(dispatcher).dispatchAsync(canRetry.getId());
        verify(dispatcher, never()).dispatchAsync(exhausted.getId());
    }

    @Test
    void retryFailed_withNothingRetryable_doesNotDispatch() {
        when(repository.findRetryableNotifications(any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(List.of());

        service.retryFailed();

        verifyNoInteractions(dispatcher);
    }

    // -------------------------------------------------------------------------
    // countUnread
    // -------------------------------------------------------------------------

    @Test
    void countUnread_queriesWithTenantIdAndSentStatus() {
        when(repository.countByTenantIdAndRecipientIdAndStatus(
                TENANT_ID, RECIPIENT_ID, NotificationStatus.SENT)).thenReturn(5L);

        long count = service.countUnread(RECIPIENT_ID);

        assertThat(count).isEqualTo(5L);
    }

    // -------------------------------------------------------------------------
    // helpers
    // -------------------------------------------------------------------------

    private void stubSave() {
        when(repository.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            setId(n);
            return n;
        });
    }

    private void stubNoPreferenceOverride() {
        when(repository.existsByTenantIdAndSourceEventIdAndChannel(any(), any(), any())).thenReturn(false);
        when(preferenceRepository.findByTenantIdAndUserIdAndCategory(any(), any(), any()))
                .thenReturn(Optional.empty());
    }

    private void setId(Notification n) {
        try {
            var field = com.andikisha.common.domain.BaseEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            if (field.get(n) == null) field.set(n, UUID.randomUUID());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private NotificationPreference mockPreference(NotificationChannel channel, boolean enabled) {
        NotificationPreference pref = NotificationPreference.create(TENANT_ID, RECIPIENT_ID, "PAYROLL");
        try {
            String fieldName = switch (channel) {
                case EMAIL -> "emailEnabled";
                case SMS -> "smsEnabled";
                case PUSH -> "pushEnabled";
                case IN_APP -> "inAppEnabled";
            };
            var f = NotificationPreference.class.getDeclaredField(fieldName);
            f.setAccessible(true);
            f.set(pref, enabled);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return pref;
    }

    private Notification makeNotification(NotificationStatus status, int retryCount) {
        Notification n = Notification.create(
                TENANT_ID, RECIPIENT_ID, "Test", "t@t.com", null,
                NotificationChannel.EMAIL, "CAT", "Sub", "Body",
                NotificationPriority.NORMAL, "src", "type");
        try {
            var idField = com.andikisha.common.domain.BaseEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(n, UUID.randomUUID());

            var statusField = Notification.class.getDeclaredField("status");
            statusField.setAccessible(true);
            statusField.set(n, status);

            var retryField = Notification.class.getDeclaredField("retryCount");
            retryField.setAccessible(true);
            retryField.set(n, retryCount);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return n;
    }
}
