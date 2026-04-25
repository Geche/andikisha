package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.repository.HeadcountSnapshotRepository;
import com.andikisha.analytics.infrastructure.messaging.EmployeeEventListener;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeEventListenerTest {

    @Mock private HeadcountSnapshotRepository repository;

    @InjectMocks private EmployeeEventListener listener;

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
    void handleEmployeeCreatedEvent_recordsNewHire() {
        EmployeeCreatedEvent event = new EmployeeCreatedEvent(
                TENANT, "emp-1", "EMP-0001", "Jane", "Doe",
                "jane@test.com", "+254700000001", "dept-1",
                new BigDecimal("150000"), "KES"
        );

        when(repository.findByTenantIdAndSnapshotDate(any(), any())).thenReturn(Optional.empty());
        when(repository.save(any(HeadcountSnapshot.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(HeadcountSnapshot.class));
    }

    @Test
    void handleEmployeeCreatedEvent_existingSnapshot_incrementsNewHires() {
        EmployeeCreatedEvent event = new EmployeeCreatedEvent(
                TENANT, "emp-1", "EMP-0001", "Jane", "Doe",
                "jane@test.com", "+254700000001", "dept-1",
                new BigDecimal("150000"), "KES"
        );

        HeadcountSnapshot existing = HeadcountSnapshot.create(TENANT, LocalDate.now());

        when(repository.findByTenantIdAndSnapshotDate(any(), any())).thenReturn(Optional.of(existing));
        when(repository.save(any(HeadcountSnapshot.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository).save(any(HeadcountSnapshot.class));
    }

    @Test
    void handleEmployeeTerminatedEvent_recordsExit() {
        EmployeeTerminatedEvent event = new EmployeeTerminatedEvent(
                TENANT, "emp-1", "Resigned", "admin"
        );

        when(repository.findByTenantIdAndSnapshotDate(any(), any())).thenReturn(Optional.empty());
        when(repository.save(any(HeadcountSnapshot.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository, org.mockito.Mockito.times(2)).save(any(HeadcountSnapshot.class));
    }

    @Test
    void handleEmployeeTerminatedEvent_existingSnapshot_incrementsExits() {
        EmployeeTerminatedEvent event = new EmployeeTerminatedEvent(
                TENANT, "emp-1", "Resigned", "admin"
        );

        HeadcountSnapshot existing = HeadcountSnapshot.create(TENANT, LocalDate.now());

        when(repository.findByTenantIdAndSnapshotDate(any(), any())).thenReturn(Optional.of(existing));
        when(repository.save(any(HeadcountSnapshot.class))).thenAnswer(inv -> inv.getArgument(0));

        listener.handle(event);

        verify(repository).save(any(HeadcountSnapshot.class));
    }

    @Test
    void handleNonEmployeeEvent_ignores() {
        PayrollInitiatedEvent event = new PayrollInitiatedEvent(
                TENANT, "run-1", "2026-04", 10, "admin"
        );

        listener.handle(event);

        verify(repository, never()).save(any());
    }
}
