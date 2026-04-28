-- ============================================================
-- STEP 1: Add feature flag columns to plans table.
-- analytics_enabled and max_employees already exist from V1.
-- Only ewa_enabled and multi_country_enabled are new.
-- DEFAULT values ensure existing rows pass NOT NULL constraint.
-- ============================================================
ALTER TABLE plans
    ADD COLUMN IF NOT EXISTS ewa_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS multi_country_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- STEP 2: Set correct feature flag values per plan tier.
-- Plan names are 'Starter', 'Professional', 'Enterprise' as
-- seeded in V1.
-- ============================================================
UPDATE plans SET
    ewa_enabled           = FALSE,
    multi_country_enabled = FALSE
WHERE name = 'Starter';

UPDATE plans SET
    ewa_enabled           = TRUE,
    multi_country_enabled = FALSE
WHERE name = 'Professional';

UPDATE plans SET
    ewa_enabled           = TRUE,
    multi_country_enabled = TRUE
WHERE name = 'Enterprise';

-- ============================================================
-- STEP 3: Create tenant_country_pack table.
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_country_pack (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    tenant_id    VARCHAR(255) NOT NULL,
    country      VARCHAR(10)  NOT NULL,
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    activated_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    activated_by VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    version      BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT pk_tenant_country_pack PRIMARY KEY (id),
    CONSTRAINT uq_tenant_country      UNIQUE (tenant_id, country)
);

CREATE INDEX IF NOT EXISTS idx_tcp_tenant_id ON tenant_country_pack (tenant_id);

-- ============================================================
-- STEP 4: Create tenant_ewa_config table.
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_ewa_config (
    id                      UUID           NOT NULL DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(255)   NOT NULL,
    ewa_enabled             BOOLEAN        NOT NULL DEFAULT FALSE,
    monthly_float_limit     NUMERIC(19, 4) NOT NULL DEFAULT 0,
    max_advance_percent     NUMERIC(5, 2)  NOT NULL DEFAULT 50.00,
    transaction_fee_percent NUMERIC(5, 2)  NOT NULL DEFAULT 1.00,
    min_tenure_months       INTEGER        NOT NULL DEFAULT 3,
    currency                VARCHAR(10)    NOT NULL DEFAULT 'KES',
    created_at              TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP      NOT NULL DEFAULT NOW(),
    version                 BIGINT         NOT NULL DEFAULT 0,
    CONSTRAINT pk_tenant_ewa_config PRIMARY KEY (id),
    CONSTRAINT uq_tenant_ewa         UNIQUE (tenant_id)
);

-- ============================================================
-- STEP 5: Create tenant_licence table.
-- plan_id is an application-level UUID reference to plans.id.
-- No database-level foreign key per cross-service architecture rule.
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_licence (
    id               UUID           NOT NULL DEFAULT gen_random_uuid(),
    tenant_id        VARCHAR(255)   NOT NULL,
    plan_id          UUID           NOT NULL,
    licence_key      UUID           NOT NULL DEFAULT gen_random_uuid(),
    billing_cycle    VARCHAR(20)    NOT NULL,
    seat_count       INTEGER        NOT NULL,
    agreed_price_kes NUMERIC(19, 4) NOT NULL,
    currency         VARCHAR(10)    NOT NULL DEFAULT 'KES',
    start_date       DATE           NOT NULL,
    end_date         DATE           NOT NULL,
    status           VARCHAR(30)    NOT NULL DEFAULT 'ACTIVE',
    suspended_at     TIMESTAMP,
    cancelled_reason TEXT,
    created_by       VARCHAR(255)   NOT NULL,
    last_modified_by VARCHAR(255),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    version          BIGINT         NOT NULL DEFAULT 0,
    CONSTRAINT pk_tenant_licence PRIMARY KEY (id),
    CONSTRAINT uq_licence_key    UNIQUE (licence_key)
);

CREATE INDEX IF NOT EXISTS idx_tl_tenant_id ON tenant_licence (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tl_status    ON tenant_licence (status);
CREATE INDEX IF NOT EXISTS idx_tl_end_date  ON tenant_licence (end_date);

-- ============================================================
-- STEP 6: Create licence_history table (append-only).
-- Every licence status transition produces one row here.
-- Rows are never updated.
-- ============================================================
CREATE TABLE IF NOT EXISTS licence_history (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(255) NOT NULL,
    licence_id      UUID         NOT NULL,
    previous_status VARCHAR(30)  NOT NULL,
    new_status      VARCHAR(30)  NOT NULL,
    changed_by      VARCHAR(255) NOT NULL,
    change_reason   TEXT,
    changed_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_licence_history PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_lh_licence_id ON licence_history (licence_id);
CREATE INDEX IF NOT EXISTS idx_lh_tenant_id  ON licence_history (tenant_id);
