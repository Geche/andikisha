CREATE TABLE statutory_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    country         VARCHAR(5) NOT NULL,
    rate_type       VARCHAR(50) NOT NULL,
    rate_value       NUMERIC(10,6) NOT NULL,
    limit_amount    NUMERIC(15,2),
    secondary_limit NUMERIC(15,2),
    fixed_amount    NUMERIC(15,2),
    description     VARCHAR(500),
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_statutory_rates_country ON statutory_rates(country, is_active);
CREATE INDEX idx_statutory_rates_type ON statutory_rates(country, rate_type);