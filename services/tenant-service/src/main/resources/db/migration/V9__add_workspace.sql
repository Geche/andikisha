-- V9__add_workspace.sql
-- Replace workspace_slug (max 50, query-param resolve) with workspace (max 20, path-param resolve).
-- New format: lowercase letters, numbers, hyphens; must start AND end with alphanumeric; max 20 chars.

-- 1. Add the new column as nullable for safe backfill.
ALTER TABLE tenants ADD COLUMN workspace VARCHAR(20);

-- 2. Backfill: derive workspace from existing workspace_slug.
--    Truncate to 20 chars, strip any trailing hyphens introduced by truncation, deduplicate.
DO $$
DECLARE
    rec       RECORD;
    base_ws   TEXT;
    candidate TEXT;
    n         INT;
BEGIN
    FOR rec IN SELECT id, workspace_slug FROM tenants ORDER BY created_at LOOP
        base_ws := left(rec.workspace_slug, 20);
        base_ws := regexp_replace(base_ws, '-+$', '');

        candidate := base_ws;
        n         := 1;
        WHILE EXISTS (SELECT 1 FROM tenants WHERE workspace = candidate) LOOP
            -- Reserve 3 chars for the numeric suffix (-N, -99 max before base truncates further).
            candidate := left(base_ws, 17) || '-' || n;
            n         := n + 1;
        END LOOP;

        UPDATE tenants SET workspace = candidate WHERE id = rec.id;
    END LOOP;
END $$;

-- 3. Override the demo tenant to workspace = 'demo' (predictable for dev/staging logins).
DO $$
DECLARE
    demo_id UUID;
    old_ws  TEXT;
BEGIN
    SELECT id INTO demo_id FROM tenants WHERE company_name ILIKE '%demo%' ORDER BY created_at LIMIT 1;
    IF demo_id IS NOT NULL THEN
        SELECT workspace INTO old_ws FROM tenants WHERE id = demo_id;
        -- Free 'demo' if another row already holds it.
        UPDATE tenants SET workspace = old_ws || '-2'
        WHERE workspace = 'demo' AND id != demo_id;
        UPDATE tenants SET workspace = 'demo' WHERE id = demo_id;
    END IF;
END $$;

-- 4. Enforce constraints now that all rows have a value.
ALTER TABLE tenants ALTER COLUMN workspace SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT uk_tenants_workspace UNIQUE (workspace);
ALTER TABLE tenants ADD CONSTRAINT chk_tenants_workspace
    CHECK (workspace ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$');

-- 5. Index for O(1) resolution at login time.
CREATE INDEX idx_tenants_workspace ON tenants (workspace);

-- 6. Drop the old column and its constraints/index.
DROP INDEX IF EXISTS idx_tenants_workspace_slug;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS uk_tenants_workspace_slug;
ALTER TABLE tenants DROP COLUMN workspace_slug;
