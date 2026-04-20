CREATE TABLE documents (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50)  NOT NULL,
    employee_id     UUID,
    employee_name   VARCHAR(200),
    document_type   VARCHAR(30)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     VARCHAR(500),
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size       BIGINT,
    content_type    VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    status          VARCHAR(15)  NOT NULL DEFAULT 'GENERATING',
    period          VARCHAR(20),
    payroll_run_id  UUID,
    generated_by    VARCHAR(100),
    generated_at    TIMESTAMP,
    error_message   VARCHAR(1000),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_documents_tenant   ON documents(tenant_id);
CREATE INDEX idx_documents_employee ON documents(tenant_id, employee_id);
CREATE INDEX idx_documents_type     ON documents(tenant_id, document_type);
CREATE INDEX idx_documents_payroll  ON documents(tenant_id, payroll_run_id);
CREATE INDEX idx_documents_period   ON documents(tenant_id, period);
