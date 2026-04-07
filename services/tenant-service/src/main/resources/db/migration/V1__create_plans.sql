CREATE TABLE plans (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    name                    VARCHAR(50) NOT NULL UNIQUE,
    tier                    VARCHAR(20) NOT NULL,
    monthly_price_amount    NUMERIC(15,2) NOT NULL,
    monthly_price_currency  VARCHAR(3) NOT NULL DEFAULT 'KES',
    max_employees           INTEGER NOT NULL,
    max_admins              INTEGER NOT NULL,
    payroll_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    leave_enabled           BOOLEAN NOT NULL DEFAULT TRUE,
    attendance_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    documents_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    analytics_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    version                 BIGINT NOT NULL DEFAULT 0
);

-- Seed default plans
INSERT INTO plans (id, tenant_id, name, tier, monthly_price_amount, monthly_price_currency,
                   max_employees, max_admins, payroll_enabled, leave_enabled,
                   attendance_enabled, documents_enabled, analytics_enabled)
VALUES
    (gen_random_uuid(), 'SYSTEM', 'Starter', 'STARTER', 2500, 'KES',
     25, 2, TRUE, TRUE, FALSE, FALSE, FALSE),
    (gen_random_uuid(), 'SYSTEM', 'Professional', 'PROFESSIONAL', 7500, 'KES',
     100, 5, TRUE, TRUE, TRUE, TRUE, FALSE),
    (gen_random_uuid(), 'SYSTEM', 'Enterprise', 'ENTERPRISE', 15000, 'KES',
     500, 20, TRUE, TRUE, TRUE, TRUE, TRUE);
