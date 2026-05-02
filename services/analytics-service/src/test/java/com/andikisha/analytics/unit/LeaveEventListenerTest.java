package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.repository.LeaveAnalyticsRepository;
import com.andikisha.analytics.infrastructure.messaging.LeaveEventListener;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.leave.LeaveApprovedEvent;
import com.andikisha.events.leave.LeaveRejectedEvent;
import com.andikisha.events.leave.LeaveRequestedEvent;
import com.andikisha.events.payroll.PayrollInitiatedEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveEventListenerTest {

    @Mock private LeaveAnalyticsRepository repository;

    @InjectMocks private LeaveEventListener listener;

    private static final String TENANT = "tenant-a";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void handleLeaveRequestedEvent_recordsSubmission() {
        LeaveRequestedEvent event = new LeaveRequestedEvent(
                TENANT, "req-1", "emp-1", "ANNUAL",
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5), new BigDecimal("5.0")
        );

        when(repository.findByTenantIdAndPeriodAndLeaveType(TENANT, "2026-04", "ANNUAL"))
                .thenReturn(Optional.empty());
        when(repository.save(any(LeaveAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(LeaveAnalytics.class));
    }

    @Test
    void handleLeaveRequestedEvent_existingRecord_incrementsSubmission() {
        LeaveRequestedEvent event = new LeaveRequestedEvent(
                TENANT, "req-1", "emp-1", "ANNUAL",
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5), new BigDecimal("5.0")
        );

        LeaveAnalytics existing = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");

        when(repository.findByTenantIdAndPeriodAndLeaveType(TENANT, "2026-04", "ANNUAL"))
                .thenReturn(Optional.of(existing));
        when(repository.save(any(LeaveAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository).save(any(LeaveAnalytics.class));
    }

    @Test
    void handleLeaveApprovedEvent_recordsApproval() {
        LeaveApprovedEvent event = new LeaveApprovedEvent(
                TENANT, "req-1", "emp-1", "ANNUAL",
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5),
                new BigDecimal("5.0"), "admin"
        );

        when(repository.findByTenantIdAndPeriodAndLeaveType(TENANT, "2026-04", "ANNUAL"))
                .thenReturn(Optional.empty());
        when(repository.save(any(LeaveAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(LeaveAnalytics.class));
    }

    @Test
    void handleLeaveApprovedEvent_existingRecord_incrementsApproval() {
        LeaveApprovedEvent event = new LeaveApprovedEvent(
                TENANT, "req-1", "emp-1", "ANNUAL",
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5),
                new BigDecimal("5.0"), "admin"
        );

        LeaveAnalytics existing = LeaveAnalytics.create(TENANT, "2026-04", "ANNUAL");

        when(repository.findByTenantIdAndPeriodAndLeaveType(TENANT, "2026-04", "ANNUAL"))
                .thenReturn(Optional.of(existing));
        when(repository.save(any(LeaveAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository).save(any(LeaveAnalytics.class));
    }

    @Test
    void handleLeaveRejectedEvent_recordsRejection() {
        LeaveRejectedEvent event = new LeaveRejectedEvent(
                TENANT, "req-1", "emp-1", "SICK",
                "Insufficient cover", "admin"
        );

        when(repository.findByTenantIdAndPeriodAndLeaveType(TENANT, YearMonth.now().toString(), "SICK"))
                .thenReturn(Optional.empty());
        when(repository.save(any(LeaveAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(LeaveAnalytics.class));
    }

    @Test
    void handleLeaveRejectedEvent_usesLeaveTypeFromEvent() {
        LeaveRejectedEvent event = new LeaveRejectedEvent(
                TENANT, "req-1", "emp-1", "MATERNITY",
                "Insufficient cover", "admin"
        );

        when(repository.findByTenantIdAndPeriodAndLeaveType(TENANT, YearMonth.now().toString(), "MATERNITY"))
                .thenReturn(Optional.empty());
        when(repository.save(any(LeaveAnalytics.class))).thenAnswer(inv -> {
            LeaveAnalytics la = inv.getArgument(0);
            assertThat(la.getLeaveType()).isEqualTo("MATERNITY");
            return la;
        });

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(LeaveAnalytics.class));
    }

    @Test
    void handleNonLeaveEvent_ignores() {
        PayrollInitiatedEvent event = new PayrollInitiatedEvent(
                TENANT, "run-1", "2026-04", 10, "admin"
        );

        listener.handle(event);

        verify(repository, never()).save(any());
    }
}
