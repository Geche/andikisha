CREATE TABLE feature_flags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(50) NOT NULL,
    feature_key VARCHAR(100) NOT NULL,
    enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    version     BIGINT NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, feature_key)
);

CREATE INDEX idx_feature_flags_tenant ON feature_flags(tenant_id);
