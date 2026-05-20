-- V8__add_workspace_slug.sql

-- 1. Add nullable column first (allows safe backfill)
ALTER TABLE tenants ADD COLUMN workspace_slug VARCHAR(50);

-- 2. Backfill: generate unique kebab-case slugs from company_name
DO $$
DECLARE
    rec       RECORD;
    base_slug TEXT;
    candidate TEXT;
    n         INT;
BEGIN
    FOR rec IN SELECT id, company_name FROM tenants ORDER BY created_at LOOP
        -- lowercase → replace non-alphanumeric runs with '-' → strip leading/trailing '-'
        base_slug := lower(rec.company_name);
        base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
        base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
        base_slug := left(base_slug, 50);
        -- Trim trailing '-' again after truncation
        base_slug := regexp_replace(base_slug, '-+$', '');

        candidate := base_slug;
        n         := 1;
        WHILE EXISTS (SELECT 1 FROM tenants WHERE workspace_slug = candidate) LOOP
            candidate := left(base_slug, 47) || '-' || n;
            n         := n + 1;
        END LOOP;

        UPDATE tenants SET workspace_slug = candidate WHERE id = rec.id;
    END LOOP;
END $$;

-- 3. Override demo tenant slug to 'demo'.
--    Auto-generation from company_name yields e.g. "andikisha-demo-co" which is painful to type.
--    'demo' is the canonical dev/staging workspace identifier.
DO $$
DECLARE
    demo_id UUID;
    old_slug TEXT;
BEGIN
    SELECT id INTO demo_id FROM tenants WHERE company_name ILIKE '%demo%' ORDER BY created_at LIMIT 1;
    IF demo_id IS NOT NULL THEN
        SELECT workspace_slug INTO old_slug FROM tenants WHERE id = demo_id;
        -- Free up 'demo' if another row already holds it
        UPDATE tenants SET workspace_slug = old_slug || '-2'
        WHERE workspace_slug = 'demo' AND id != demo_id;
        UPDATE tenants SET workspace_slug = 'demo' WHERE id = demo_id;
    END IF;
END $$;

-- 4. Enforce NOT NULL + UNIQUE now that all rows have a value
ALTER TABLE tenants ALTER COLUMN workspace_slug SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT uk_tenants_workspace_slug UNIQUE (workspace_slug);

-- 5. Index for O(1) slug resolution at login time
CREATE INDEX idx_tenants_workspace_slug ON tenants (workspace_slug);
