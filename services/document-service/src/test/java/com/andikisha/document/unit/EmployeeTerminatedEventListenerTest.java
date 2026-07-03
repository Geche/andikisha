package com.andikisha.document.unit;

import com.andikisha.document.application.service.CertificateOfServiceGenerator;
import com.andikisha.document.infrastructure.messaging.EmployeeTerminatedEventListener;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZoneOffset;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeTerminatedEventListenerTest {

    @Mock CertificateOfServiceGenerator generator;

    @Test
    void handle_terminationEvent_dispatchesGenerationWithEventDateFallback() {
        EmployeeTerminatedEventListener listener = new EmployeeTerminatedEventListener(generator);
        String employeeId = UUID.randomUUID().toString();
        EmployeeTerminatedEvent event =
                new EmployeeTerminatedEvent("tenant-1", employeeId, "Redundancy", "hr-admin");

        listener.handle(event);

        var expectedDate = event.getTimestamp().atZone(ZoneOffset.UTC).toLocalDate();
        verify(generator).generateAsync(eq("tenant-1"), eq(employeeId), eq(expectedDate));
    }

    @Test
    void handle_nonTerminationEvent_isIgnored() {
        EmployeeTerminatedEventListener listener = new EmployeeTerminatedEventListener(generator);
        BaseEvent other = mock(BaseEvent.class);
        when(other.getTenantId()).thenReturn("tenant-1");

        listener.handle(other);

        verifyNoInteractions(generator);
    }
}
