-- Primary query pattern: list audit entries by tenant, most recent first
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_created
    ON audit_entries (tenant_id, occurred_at DESC);

-- Query by domain (e.g., all PAYROLL events for a tenant)
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_domain
    ON audit_entries (tenant_id, domain, occurred_at DESC);

-- Query by actor (e.g., all actions by a specific user)
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_actor
    ON audit_entries (tenant_id, actor_id, occurred_at DESC);

-- Query by resource (e.g., all events for a specific PayrollRun UUID)
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_resource
    ON audit_entries (tenant_id, resource_type, resource_id, occurred_at DESC);

-- Query by action type
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_action
    ON audit_entries (tenant_id, action, occurred_at DESC);
