-- V10__fix_admin_email_constraint.sql
-- Behavior A: same admin email allowed across tenants (a consultant administering multiple SMEs).
-- The global UNIQUE(admin_email) enforced Behavior B — contradicting the locked design decision.
-- Replace with UNIQUE(admin_email, tenant_id): blocks duplicate emails within the same tenant,
-- allows the same email as admin of multiple different tenants.

-- Safety check: abort if any (admin_email, tenant_id) pair already appears more than once.
-- This should be zero rows given the global constraint, but verify before destructive ops.
DO $$
BEGIN
    IF EXISTS (
        SELECT admin_email, tenant_id
        FROM tenants
        GROUP BY admin_email, tenant_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate (admin_email, tenant_id) pairs found — migration aborted. Resolve duplicates manually before retrying.';
    END IF;
END $$;

-- Drop the global unique constraint.
ALTER TABLE tenants DROP CONSTRAINT tenants_admin_email_key;

-- Add the composite unique constraint (admin_email scoped to tenant).
ALTER TABLE tenants ADD CONSTRAINT uk_tenants_admin_email_tenant
    UNIQUE (admin_email, tenant_id);
