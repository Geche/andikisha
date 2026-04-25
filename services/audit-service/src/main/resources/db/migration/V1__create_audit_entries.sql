CREATE TABLE audit_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50) NOT NULL,
    domain          VARCHAR(20) NOT NULL,
    action          VARCHAR(20) NOT NULL,
    resource_type   VARCHAR(50) NOT NULL,
    resource_id     VARCHAR(100),
    actor_id        VARCHAR(100),
    actor_name      VARCHAR(200),
    actor_role      VARCHAR(30),
    description     VARCHAR(500),
    event_type      VARCHAR(100) NOT NULL,
    event_id        VARCHAR(100),
    event_data      TEXT,
    ip_address      VARCHAR(45),
    occurred_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_entries(tenant_id);
CREATE INDEX idx_audit_domain ON audit_entries(tenant_id, domain);
CREATE INDEX idx_audit_action ON audit_entries(tenant_id, action);
CREATE INDEX idx_audit_resource ON audit_entries(tenant_id, resource_type, resource_id);
CREATE INDEX idx_audit_actor ON audit_entries(tenant_id, actor_id);
CREATE INDEX idx_audit_occurred ON audit_entries(tenant_id, occurred_at DESC);
CREATE INDEX idx_audit_event_type ON audit_entries(event_type);