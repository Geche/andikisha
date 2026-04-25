CREATE TABLE payroll_summaries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           VARCHAR(50) NOT NULL,
    period              VARCHAR(7) NOT NULL,
    employee_count      INTEGER NOT NULL DEFAULT 0,
    total_gross         NUMERIC(15,2) DEFAULT 0,
    total_net           NUMERIC(15,2) DEFAULT 0,
    total_paye          NUMERIC(15,2) DEFAULT 0,
    total_nssf          NUMERIC(15,2) DEFAULT 0,
    total_shif          NUMERIC(15,2) DEFAULT 0,
    total_housing_levy  NUMERIC(15,2) DEFAULT 0,
    average_gross       NUMERIC(15,2) DEFAULT 0,
    average_net         NUMERIC(15,2) DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'KES',
    payroll_run_id      VARCHAR(50),
    approved_by         VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, period)
);

CREATE INDEX idx_payroll_summaries_tenant ON payroll_summaries(tenant_id);
CREATE INDEX idx_payroll_summaries_period ON payroll_summaries(tenant_id, period);