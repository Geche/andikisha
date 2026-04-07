-- Index for tenant_id lookups on the tenants table (every query filters by this)
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id);

-- Index to speed up trial-expiry scheduled queries
CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at ON tenants(trial_ends_at)
    WHERE status = 'TRIAL';
