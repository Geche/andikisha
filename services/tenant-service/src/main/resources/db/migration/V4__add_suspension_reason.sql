ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR(500);
