CREATE TABLE document_templates (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50)  NOT NULL,
    document_type   VARCHAR(30)  NOT NULL,
    name            VARCHAR(100) NOT NULL,
    template_body   TEXT         NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, document_type)
);

CREATE INDEX idx_doc_templates_tenant ON document_templates(tenant_id);
