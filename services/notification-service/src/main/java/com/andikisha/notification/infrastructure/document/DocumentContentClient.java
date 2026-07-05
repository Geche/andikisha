package com.andikisha.notification.infrastructure.document;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Fetches a document's file bytes from document-service to attach to a delivery email (#54).
 *
 * <p>Uses document-service's existing guarded /download endpoint over an internal call with the
 * gateway-style trusted headers (privileged role). This is the #53 decision (internal REST) —
 * lower-infra than standing up gRPC in notification-service.
 */
@Component
public class DocumentContentClient {

    private final RestClient restClient;

    public DocumentContentClient(
            @Value("${app.document-service.url:http://localhost:8088}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public byte[] download(String tenantId, String documentId) {
        return restClient.get()
                .uri("/api/v1/documents/{id}/download", documentId)
                .header("X-Tenant-ID", tenantId)
                .header("X-User-ID", "notification-service")
                .header("X-User-Role", "ADMIN")
                .retrieve()
                .body(byte[].class);
    }
}
