package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.PayrollSummary;
import com.andikisha.analytics.domain.repository.PayrollSummaryRepository;
import com.andikisha.analytics.infrastructure.messaging.PayrollEventListener;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.events.payroll.PayrollInitiatedEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PayrollEventListenerTest {

    @Mock private PayrollSummaryRepository repository;

    @InjectMocks private PayrollEventListener listener;

    private static final String TENANT = "tenant-a";
    private static final String PERIOD = "2026-04";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void handlePayrollApprovedEvent_createsSummary() {
        PayrollApprovedEvent event = new PayrollApprovedEvent(
                TENANT, "run-1", PERIOD, 10,
                new BigDecimal("1000000.00"), new BigDecimal("800000.00"),
                new BigDecimal("150000.00"), new BigDecimal("10000.00"),
                new BigDecimal("27500.00"), new BigDecimal("15000.00"),
                "admin"
        );

        when(repository.findByTenantIdAndPeriod(TENANT, PERIOD)).thenReturn(Optional.empty());
        when(repository.save(any(PayrollSummary.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository).save(any(PayrollSummary.class));
    }

    @Test
    void handlePayrollApprovedEvent_whenSummaryAlreadyExists_isIdempotent() {
        PayrollApprovedEvent event = new PayrollApprovedEvent(
                TENANT, "run-1", PERIOD, 10,
                BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO,
                "admin"
        );

        PayrollSummary existing = PayrollSummary.create(
                TENANT, PERIOD, 10, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                "run-1", "admin"
        );

        when(repository.findByTenantIdAndPeriod(TENANT, PERIOD)).thenReturn(Optional.of(existing));

        listener.handle(event);

        verify(repository, never()).save(any());
    }

    @Test
    void handleNonPayrollEvent_ignores() {
        PayrollInitiatedEvent event = new PayrollInitiatedEvent(
                TENANT, "run-1", PERIOD, 10, "admin"
        );

        listener.handle(event);

        verify(repository, never()).save(any());
    }
}
