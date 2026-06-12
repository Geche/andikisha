-- AUTH-006: optional human display name for a user.
-- NULL means "no name set" — callers fall back to email at read time. We deliberately
-- do NOT copy the email into this column, so "no name" stays distinct from "name equals
-- email". Populated at provisioning (from the linked employee) and a one-time backfill;
-- the employee record remains the source of truth.
-- See docs/decisions/2026-06-12-auth-user-display-name.md
ALTER TABLE users ADD COLUMN display_name VARCHAR(200);
