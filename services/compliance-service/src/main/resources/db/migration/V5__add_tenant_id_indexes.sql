-- tenant_id indexes to support future tenant-specific compliance overrides
-- and to make all tenant-filtered queries performant at scale.

CREATE INDEX idx_tax_brackets_tenant    ON tax_brackets(tenant_id);
CREATE INDEX idx_statutory_rates_tenant ON statutory_rates(tenant_id);
CREATE INDEX idx_tax_reliefs_tenant     ON tax_reliefs(tenant_id);
