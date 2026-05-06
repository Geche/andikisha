-- V11__add_superadmin_sessions.sql
CREATE TABLE superadmin_sessions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id  UUID         NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ  NOT NULL,
    revoked_at     TIMESTAMPTZ,
    ip_address     VARCHAR(64),
    user_agent     TEXT
);

CREATE INDEX idx_superadmin_sessions_admin_user_id ON superadmin_sessions(admin_user_id);
CREATE INDEX idx_superadmin_sessions_expires_at    ON superadmin_sessions(expires_at);
