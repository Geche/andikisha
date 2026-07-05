package com.andikisha.notification.unit;

import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.notification.application.listener.DocumentEventListener;
import com.andikisha.notification.application.port.EmailSender;
import com.andikisha.notification.infrastructure.document.DocumentContentClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentEventListenerTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock EmailSender emailSender;
    @Mock DocumentContentClient documentContentClient;

    private DocumentEventListener listener() {
        return new DocumentEventListener(emailSender, documentContentClient);
    }

    @Test
    void handle_certificateWithRecipient_fetchesPdfAndEmailsAttachment() {
        String docId = UUID.randomUUID().toString();
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, docId,
                UUID.randomUUID().toString(), "CERTIFICATE_OF_SERVICE", "cert.pdf", null, "bob@personal.com");
        when(documentContentClient.download(TENANT_ID, docId)).thenReturn("PDF-BYTES".getBytes());

        listener().handle(event);

        verify(documentContentClient).download(TENANT_ID, docId);
        verify(emailSender).sendWithAttachment(eq("bob@personal.com"), any(), any(),
                eq("cert.pdf"), any(byte[].class), eq("application/pdf"));
    }

    @Test
    void handle_certificateWithoutRecipient_skipsDelivery() {
        // #54: personal email only — no recipient means skip (HR delivers via download).
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, UUID.randomUUID().toString(),
                UUID.randomUUID().toString(), "CERTIFICATE_OF_SERVICE", "cert.pdf", null, null);

        listener().handle(event);

        verifyNoInteractions(documentContentClient, emailSender);
    }

    @Test
    void handle_payslip_isIgnored() {
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, UUID.randomUUID().toString(),
                UUID.randomUUID().toString(), "PAYSLIP", "payslip.pdf", "2026-06", "x@y.com");

        listener().handle(event);

        verifyNoInteractions(documentContentClient, emailSender);
    }

    @Test
    void handle_certificatePdfFetchFails_doesNotSendEmail() {
        String docId = UUID.randomUUID().toString();
        DocumentReadyEvent event = new DocumentReadyEvent(TENANT_ID, docId,
                UUID.randomUUID().toString(), "CERTIFICATE_OF_SERVICE", "cert.pdf", null, "bob@personal.com");
        when(documentContentClient.download(TENANT_ID, docId)).thenThrow(new RuntimeException("doc-service down"));

        listener().handle(event);

        verifyNoInteractions(emailSender);
    }
}
