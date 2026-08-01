-- AUTH-BACKLOG-001 (admin employee self-service): the auto-link between an employee record and its
-- auth user matches on (tenant_id, email), so a duplicate email within a tenant would make the link
-- ambiguous and let a concurrent self-setup double-submit create two records. Promote the existing
-- non-unique idx_employees_email to a real uniqueness guarantee.
--
-- Partial: email is nullable (bulk pending-activation rows may have none), and archived (terminated)
-- rows must not block a fresh hire reusing an address. Email is lowercased on write
-- (Employee.create/update), so no lower() is needed.
--
-- PRECONDITION (deploy gate): before applying this in any environment, confirm there are no existing
-- duplicates — this index creation FAILS on them. Run:
--   SELECT tenant_id, lower(email) AS email, count(*)
--   FROM employees
--   WHERE email IS NOT NULL AND archived_at IS NULL
--   GROUP BY tenant_id, lower(email)
--   HAVING count(*) > 1;
-- If it returns rows, resolve them in a separate, prior change with its own decision record — never
-- clean up data inside this feature migration.

CREATE UNIQUE INDEX idx_employees_tenant_email_unique
    ON employees (tenant_id, email)
    WHERE email IS NOT NULL AND archived_at IS NULL;
