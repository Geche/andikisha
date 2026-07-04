package com.andikisha.tenant.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * A tenant's company logo (one per tenant), stored out-of-line from {@code tenants} so the blob
 * is never loaded on ordinary tenant queries. Used for document branding — e.g. the Certificate
 * of Service letterhead (#57).
 */
@Entity
@Table(name = "tenant_logo")
public class TenantLogo {

    @Id
    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(nullable = false)
    private byte[] data;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected TenantLogo() {
    }

    public static TenantLogo of(String tenantId, String contentType, byte[] data) {
        TenantLogo logo = new TenantLogo();
        logo.tenantId = tenantId;
        logo.update(contentType, data);
        return logo;
    }

    public void update(String contentType, byte[] data) {
        this.contentType = contentType;
        this.data = data;
        this.fileSize = data.length;
        this.updatedAt = LocalDateTime.now();
    }

    public String getTenantId() { return tenantId; }
    public String getContentType() { return contentType; }
    public byte[] getData() { return data; }
    public long getFileSize() { return fileSize; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
