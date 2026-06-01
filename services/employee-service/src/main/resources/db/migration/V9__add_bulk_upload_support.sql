-- V9: Support for bulk employee upload and account activation tracking.

-- Track validated bulk upload batches awaiting HR commit confirmation.
CREATE TABLE bulk_upload_batches (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50)  NOT NULL,
    total_rows      INTEGER      NOT NULL,
    valid_rows      INTEGER      NOT NULL,
    error_count     INTEGER      NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING_COMMIT',
    uploaded_by     VARCHAR(100) NOT NULL,
    validated_rows  TEXT,        -- JSON array of validated row data
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_bulk_status CHECK (status IN ('PENDING_COMMIT','COMMITTED','EXPIRED'))
);

CREATE INDEX idx_bulk_batches_tenant ON bulk_upload_batches (tenant_id, created_at DESC);

-- Track which employees are pending account activation (bulk-uploaded but not yet provisioned).
ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS pending_activation BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_employees_pending_activation
    ON employees (tenant_id, pending_activation)
    WHERE pending_activation = TRUE;
