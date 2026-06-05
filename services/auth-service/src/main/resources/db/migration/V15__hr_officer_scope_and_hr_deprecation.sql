-- V15: Complete the HR → HR_OFFICER rename (M-3 fix).
--
-- Background:
--   V6 seeded permissions for a legacy 'HR' role that was never added to the Role enum.
--   The onboarding plan (2026-05-22) explicitly defines HR_OFFICER as one of the five V1
--   authority roles with employee:read/update:all and leave:read:all capability.
--   HR_OFFICER was never seeded, causing CallerScopeResolver to silently resolve it to OWN.
--
-- This migration:
--   1. Inserts HR_OFFICER permission rows (the intended operational set).
--   2. Deletes the legacy HR permission rows (replacing them with HR_OFFICER).
--   3. Migrates any users with role='HR' to role='HR_OFFICER' (pre-migration audit
--      confirmed 0 rows; included for completeness on fresh installs).
--
-- HR rows being removed (confirmed by SELECT before DELETE):
--   HR | employee | create  | all   ← was a seed inconsistency; create stays HR_MANAGER+ADMIN
--   HR | employee | read    | all
--   HR | employee | update  | all
--   HR | leave    | approve | all   ← approve stays HR_MANAGER+LINE_MANAGER
--   HR | leave    | read    | all
--   HR | report   | read    | all

-- ── 1. Seed HR_OFFICER permissions ────────────────────────────────────────────
-- HR_OFFICER is operational HR access: read and update employees, read leave.
-- It deliberately does NOT include:
--   employee:create — stays with HR_MANAGER and ADMIN
--   leave:approve   — stays with HR_MANAGER, ADMIN, and LINE_MANAGER (dept-scoped)
--   any payroll     — stays with PAYROLL_OFFICER

INSERT INTO role_permissions (id, tenant_id, role, permission_id)
SELECT gen_random_uuid(), 'SYSTEM', 'HR_OFFICER', p.id
FROM permissions p
WHERE p.tenant_id = 'SYSTEM'
  AND CONCAT(p.resource, ':', p.action, ':', p.scope) IN (
      'employee:read:all',
      'employee:update:all',
      'leave:read:all'
  )
ON CONFLICT DO NOTHING;

-- ── 2. Remove legacy HR permission rows ───────────────────────────────────────
DELETE FROM role_permissions
WHERE tenant_id = 'SYSTEM'
  AND role = 'HR';

-- ── 3. Migrate HR-assigned users to HR_OFFICER ────────────────────────────────
-- Pre-migration audit (2026-06-05-hr-role-audit.md) found 0 rows.
-- This UPDATE is included for future-proofing and fresh installs.
UPDATE users
SET role       = 'HR_OFFICER',
    updated_at = NOW()
WHERE role = 'HR';
