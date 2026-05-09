-- Add grace_period_entered_at to tenant_licence so the expiry job can determine
-- how long a licence has been in GRACE_PERIOD without querying licence_history
-- per row (eliminates N+1 history lookups in LicenceExpiryJob).
--
-- Nullable because: existing rows in other statuses never entered GRACE_PERIOD,
-- and the column is only meaningful when status = 'GRACE_PERIOD'.
-- New rows acquire this value when LicenceStateMachineService transitions to
-- GRACE_PERIOD via TenantLicence.markGracePeriodEnteredAt().
ALTER TABLE tenant_licence
    ADD COLUMN IF NOT EXISTS grace_period_entered_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_tl_grace_entered
    ON tenant_licence (grace_period_entered_at)
    WHERE status = 'GRACE_PERIOD';
