package com.andikisha.tenant.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * A tenant's authorized signatory for issued documents (one per tenant): the name and title that
 * appear on a Certificate of Service, plus a signature image for the letterhead (#58).
 */
@Entity
@Table(name = "tenant_signatory")
public class TenantSignatory {

    @Id
    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(name = "signatory_name", nullable = false, length = 200)
    private String name;

    @Column(name = "signatory_title", nullable = false, length = 200)
    private String title;

    @Column(name = "signature_content_type", nullable = false, length = 100)
    private String signatureContentType;

    @Column(name = "signature_data", nullable = false)
    private byte[] signatureData;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected TenantSignatory() {
    }

    public static TenantSignatory of(String tenantId, String name, String title,
                                     String signatureContentType, byte[] signatureData) {
        TenantSignatory s = new TenantSignatory();
        s.tenantId = tenantId;
        s.update(name, title, signatureContentType, signatureData);
        return s;
    }

    public void update(String name, String title, String signatureContentType, byte[] signatureData) {
        this.name = name;
        this.title = title;
        this.signatureContentType = signatureContentType;
        this.signatureData = signatureData;
        this.updatedAt = LocalDateTime.now();
    }

    public String getTenantId() { return tenantId; }
    public String getName() { return name; }
    public String getTitle() { return title; }
    public String getSignatureContentType() { return signatureContentType; }
    public byte[] getSignatureData() { return signatureData; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
