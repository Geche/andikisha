CREATE TABLE permissions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(50) NOT NULL,
    resource    VARCHAR(50) NOT NULL,
    action      VARCHAR(30) NOT NULL,
    scope       VARCHAR(30) NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    version     BIGINT      NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, resource, action, scope)
);

CREATE INDEX idx_permissions_tenant ON permissions (tenant_id);
