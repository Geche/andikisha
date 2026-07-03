package com.andikisha.notification.unit;

import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.notification.application.listener.DocumentEventListener;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentEventListenerTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock NotificationService notificationService;

    private DocumentEventListener listener() {
        return new DocumentEventListener(notificationService);
    }

    @Test
    void handle_certificateReady_notifiesEmployee() {
        String employeeId = UUID.randomUUID().toString();
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, UUID.randomUUID().toString(),
                employeeId, "CERTIFICATE_OF_SERVICE", "certificate.pdf", null);

        listener().handle(event);

        verify(notificationService).sendNotification(
                eq(TENANT_ID), eq(UUID.fromString(employeeId)),
                isNull(), isNull(), isNull(),
                eq(NotificationChannel.IN_APP),
                eq("OFFBOARDING"), eq("Certificate of Service Available"), any(),
                eq(NotificationPriority.NORMAL),
                eq(event.getEventId()), eq(event.getEventType()));
    }

    @Test
    void handle_payslipReady_isIgnored() {
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, UUID.randomUUID().toString(),
                UUID.randomUUID().toString(), "PAYSLIP", "payslip.pdf", "2026-06");

        listener().handle(event);

        verifyNoInteractions(notificationService);
    }

    @Test
    void handle_certificateReadyWithNullEmployee_isIgnored() {
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, UUID.randomUUID().toString(),
                null, "CERTIFICATE_OF_SERVICE", "certificate.pdf", null);

        listener().handle(event);

        verifyNoInteractions(notificationService);
    }
}
