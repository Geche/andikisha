CREATE TABLE payroll_runs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50)      NOT NULL,
    period                  VARCHAR(7)       NOT NULL,
    pay_frequency           VARCHAR(10)      NOT NULL DEFAULT 'MONTHLY',
    status                  VARCHAR(20)      NOT NULL DEFAULT 'DRAFT',
    employee_count          INTEGER          NOT NULL DEFAULT 0,
    total_gross             NUMERIC(15,2)    DEFAULT 0,
    total_basic             NUMERIC(15,2)    DEFAULT 0,
    total_allowances        NUMERIC(15,2)    DEFAULT 0,
    total_paye              NUMERIC(15,2)    DEFAULT 0,
    total_nssf              NUMERIC(15,2)    DEFAULT 0,
    total_shif              NUMERIC(15,2)    DEFAULT 0,
    total_housing_levy      NUMERIC(15,2)    DEFAULT 0,
    total_other_deductions  NUMERIC(15,2)    DEFAULT 0,
    total_net               NUMERIC(15,2)    DEFAULT 0,
    currency                VARCHAR(3)       NOT NULL DEFAULT 'KES',
    initiated_by            VARCHAR(100),
    approved_by             VARCHAR(100),
    approved_at             TIMESTAMP,
    completed_at            TIMESTAMP,
    notes                   VARCHAR(500),
    created_at              TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP        NOT NULL DEFAULT NOW(),
    version                 BIGINT           NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, period, pay_frequency)
);

CREATE INDEX idx_payroll_runs_tenant        ON payroll_runs (tenant_id);
CREATE INDEX idx_payroll_runs_tenant_period ON payroll_runs (tenant_id, period);
CREATE INDEX idx_payroll_runs_status        ON payroll_runs (tenant_id, status);
