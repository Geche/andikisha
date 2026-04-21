CREATE TABLE filing_records (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50) NOT NULL,
    filing_type             VARCHAR(30) NOT NULL,
    period                  VARCHAR(7) NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    employee_count          INTEGER NOT NULL DEFAULT 0,
    total_amount            NUMERIC(15,2),
    employer_amount         NUMERIC(15,2),
    file_reference          VARCHAR(100),
    acknowledgment_number   VARCHAR(100),
    submitted_at            TIMESTAMPTZ,
    confirmed_at            TIMESTAMPTZ,
    error_message           VARCHAR(1000),
    filing_data             TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version                 BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_filings_tenant ON filing_records(tenant_id);
CREATE INDEX idx_filings_type ON filing_records(tenant_id, filing_type);
CREATE INDEX idx_filings_period ON filing_records(tenant_id, period);