-- ============================================================
-- USSD session table.
-- Stores short-lived sessions created by the USSD IVR flow.
-- Sessions expire after a configurable TTL (default 5 minutes).
-- ============================================================
CREATE TABLE IF NOT EXISTS ussd_session (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(255) NOT NULL,
    employee_id VARCHAR(255),
    pin         VARCHAR(255) NOT NULL,
    msisdn      VARCHAR(20)  NOT NULL,
    expires_at  TIMESTAMP    NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    version     BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT pk_ussd_session PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_ussd_msisdn     ON ussd_session (msisdn);
CREATE INDEX IF NOT EXISTS idx_ussd_expires_at ON ussd_session (expires_at);

-- ============================================================
-- Enforce exactly one SUPER_ADMIN per SYSTEM tenant.
-- Application layer checks first and returns 409 before this
-- constraint is hit, but this is the database safety net.
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_super_admin_system
    ON users (role, tenant_id)
    WHERE role = 'SUPER_ADMIN' AND tenant_id = 'SYSTEM';
