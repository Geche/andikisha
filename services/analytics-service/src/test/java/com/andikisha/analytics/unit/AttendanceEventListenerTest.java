package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import com.andikisha.analytics.domain.repository.AttendanceAnalyticsRepository;
import com.andikisha.analytics.infrastructure.messaging.AttendanceEventListener;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.attendance.ClockInEvent;
import com.andikisha.events.attendance.ClockOutEvent;
import com.andikisha.events.payroll.PayrollInitiatedEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceEventListenerTest {

    @Mock private AttendanceAnalyticsRepository repository;

    @InjectMocks private AttendanceEventListener listener;

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
    void handleClockInEvent_recordsClockIn() {
        ClockInEvent event = new ClockInEvent(
                TENANT, "emp-1", Instant.now(), "web"
        );

        when(repository.findByTenantIdAndPeriod(any(), any())).thenReturn(Optional.empty());
        when(repository.save(any(AttendanceAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(AttendanceAnalytics.class));
    }

    @Test
    void handleClockInEvent_existingRecord_incrementsClockIn() {
        ClockInEvent event = new ClockInEvent(
                TENANT, "emp-1", Instant.now(), "web"
        );

        AttendanceAnalytics existing = AttendanceAnalytics.create(TENANT, "2026-04");

        when(repository.findByTenantIdAndPeriod(any(), any())).thenReturn(Optional.of(existing));
        when(repository.save(any(AttendanceAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(1)).save(any(AttendanceAnalytics.class));
    }

    @Test
    void handleClockOutEvent_recordsHours() {
        ClockOutEvent event = new ClockOutEvent(
                TENANT, "emp-1", Instant.now(), new BigDecimal("9.50")
        );

        when(repository.findByTenantIdAndPeriod(any(), any())).thenReturn(Optional.empty());
        when(repository.save(any(AttendanceAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(AttendanceAnalytics.class));
    }

    @Test
    void handleClockOutEvent_existingRecord_addsHours() {
        ClockOutEvent event = new ClockOutEvent(
                TENANT, "emp-1", Instant.now(), new BigDecimal("9.50")
        );

        AttendanceAnalytics existing = AttendanceAnalytics.create(TENANT, "2026-04");
        existing.recordClockIn();

        when(repository.findByTenantIdAndPeriod(any(), any())).thenReturn(Optional.of(existing));
        when(repository.save(any(AttendanceAnalytics.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository).save(any(AttendanceAnalytics.class));
    }

    @Test
    void handleNonAttendanceEvent_ignores() {
        PayrollInitiatedEvent event = new PayrollInitiatedEvent(
                TENANT, "run-1", "2026-04", 10, "admin"
        );

        listener.handle(event);

        verify(repository, never()).save(any());
    }
}
