CREATE TABLE role_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50) NOT NULL,
    role            VARCHAR(30) NOT NULL,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, role, permission_id)
);

CREATE INDEX idx_role_permissions_tenant_role ON role_permissions(tenant_id, role);