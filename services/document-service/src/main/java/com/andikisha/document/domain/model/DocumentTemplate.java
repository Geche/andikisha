package com.andikisha.document.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "document_templates",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "document_type"}))
public class DocumentTemplate extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "template_body", nullable = false, columnDefinition = "TEXT")
    private String templateBody;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected DocumentTemplate() {}

    public static DocumentTemplate create(String tenantId, DocumentType type,
                                          String name, String templateBody) {
        DocumentTemplate t = new DocumentTemplate();
        t.setTenantId(tenantId);
        t.documentType = type;
        t.name = name;
        t.templateBody = templateBody;
        t.active = true;
        return t;
    }

    public void updateTemplate(String name, String templateBody) {
        this.name = name;
        this.templateBody = templateBody;
    }

    public void deactivate() {
        this.active = false;
    }

    public DocumentType getDocumentType() { return documentType; }
    public String getName() { return name; }
    public String getTemplateBody() { return templateBody; }
    public boolean isActive() { return active; }
}
