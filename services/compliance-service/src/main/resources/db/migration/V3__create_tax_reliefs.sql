CREATE TABLE tax_reliefs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    country         VARCHAR(5) NOT NULL,
    relief_type     VARCHAR(50) NOT NULL,
    monthly_amount  NUMERIC(15,2),
    rate            NUMERIC(5,4),
    max_amount      NUMERIC(15,2),
    description     VARCHAR(500),
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_tax_reliefs_country ON tax_reliefs(country, is_active);