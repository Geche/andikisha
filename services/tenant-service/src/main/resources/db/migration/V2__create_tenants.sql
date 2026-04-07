CREATE TABLE tenants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           VARCHAR(50) NOT NULL,
    company_name        VARCHAR(200) NOT NULL,
    country             VARCHAR(5) NOT NULL,
    currency            VARCHAR(3) NOT NULL,
    kra_pin             VARCHAR(20),
    nssf_number         VARCHAR(20),
    shif_number         VARCHAR(20),
    admin_email         VARCHAR(255) NOT NULL UNIQUE,
    admin_phone         VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'TRIAL',
    plan_id             UUID NOT NULL REFERENCES plans(id),
    trial_ends_at       DATE,
    pay_frequency       VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    pay_day             INTEGER NOT NULL DEFAULT 28,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_admin_email ON tenants(admin_email);
CREATE INDEX idx_tenants_country ON tenants(country);
