package com.andikisha.notification.unit;

import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.notification.application.listener.DocumentEventListener;
import com.andikisha.notification.application.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentEventListenerTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock NotificationService notificationService;

    private DocumentEventListener listener() {
        return new DocumentEventListener(notificationService);
    }

    // #42: the certificate is not yet production-issuable (stub PDF, placeholder employer) and is
    // not self-service downloadable, so the "ready to download" notification is suppressed. This is
    // a regression guard — re-enabling a notification must be a deliberate change that updates this
    // test (and should target the ex-employee's personal email with the real certificate attached).
    @Test
    void handle_certificateReady_isSuppressedPendingRealCertificate() {
        String employeeId = UUID.randomUUID().toString();
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, UUID.randomUUID().toString(),
                employeeId, "CERTIFICATE_OF_SERVICE", "certificate.pdf", null);

        listener().handle(event);

        verifyNoInteractions(notificationService);
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
