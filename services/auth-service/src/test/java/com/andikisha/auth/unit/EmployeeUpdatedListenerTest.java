package com.andikisha.auth.unit;

import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.infrastructure.messaging.EmployeeUpdatedListener;
import com.andikisha.events.employee.EmployeeUpdatedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmployeeUpdatedListenerTest {

    @Mock private AuthService authService;
    @InjectMocks private EmployeeUpdatedListener listener;

    private static final String TENANT = "tenant-1";
    private static final String EMPLOYEE = "11111111-1111-1111-1111-111111111111";

    @Test
    void delegatesToSyncWithTenantAndEmployee() {
        listener.onEmployeeUpdated(new EmployeeUpdatedEvent(TENANT, EMPLOYEE, "updater"));

        verify(authService).syncDisplayNameFromEmployee(TENANT, EMPLOYEE);
    }

    @Test
    void swallowsExceptions_soOneBadEventDoesNotPoisonTheQueue() {
        doThrow(new RuntimeException("employee-service down"))
                .when(authService).syncDisplayNameFromEmployee(TENANT, EMPLOYEE);

        // Must not throw — the listener logs and moves on.
        listener.onEmployeeUpdated(new EmployeeUpdatedEvent(TENANT, EMPLOYEE, "updater"));

        verify(authService).syncDisplayNameFromEmployee(TENANT, EMPLOYEE);
    }
}
