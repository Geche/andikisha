-- V17 (R3-2c, TENANT-006): allow standalone admin-tier users (no employee_id).
--
-- V14 required an employee_id for every role except SUPER_ADMIN and ADMIN. That blocked
-- inviting standalone HR_MANAGER / HR_OFFICER / PAYROLL_OFFICER users (e.g. an external
-- accountant given HR_MANAGER access) — the reason the hrmanager@demo seed carries a
-- *dangling* generated employee_id as a workaround.
--
-- The constraint's real intent is "self-service roles must map to a real person." Only
-- EMPLOYEE and LINE_MANAGER are self-service; the admin-tier office roles legitimately may
-- exist without an employee record. Relax the whitelist accordingly.
--
-- Whitelist (not blacklist) is deliberate: adding a new role forces an explicit decision
-- about whether it requires an employee_id, rather than silently defaulting to "allowed".
-- Keep this list in sync with Role.ADMIN_TIER (+ SUPER_ADMIN) in the auth-service code.
--
-- NOT VALID is intentional: it grandfathers existing rows (including the hrmanager@demo
-- dangling-id, which stays as-is, harmless) and enforces on new INSERT/UPDATE only.
-- No data migration.

ALTER TABLE users
    DROP CONSTRAINT chk_operational_role_requires_employee_id;

ALTER TABLE users
    ADD CONSTRAINT chk_operational_role_requires_employee_id
    CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_OFFICER', 'PAYROLL_OFFICER')
           OR employee_id IS NOT NULL)
    NOT VALID;
