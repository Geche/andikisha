CREATE TABLE positions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(50) NOT NULL,
    title       VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    grade_level VARCHAR(20),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    version     BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, title)
);

CREATE INDEX idx_positions_tenant ON positions(tenant_id);