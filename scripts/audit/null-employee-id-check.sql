-- Audit: Users with null employee_id
-- Run against andikisha_auth database.
-- Produces the raw data for docs/Engineering/backfill/YYYY-MM-DD-null-employee-id-audit.md

-- 1. Summary counts by role
SELECT
    role,
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE employee_id IS NULL) AS null_employee_id,
    COUNT(*) FILTER (WHERE employee_id IS NOT NULL) AS has_employee_id
FROM users
GROUP BY role
ORDER BY role;

-- 2. Full list of non-SUPER_ADMIN users with null employee_id
SELECT
    u.id              AS user_id,
    u.tenant_id,
    u.email,
    u.role,
    u.is_active,
    u.created_at,
    u.last_login,
    -- Best-match employee in the same tenant by email (requires cross-db join or federated query)
    -- Replace 'andikisha_employee' with the actual employee DB if running in a federated context.
    -- Otherwise run the employee match separately (query 3 below).
    NULL              AS matched_employee_id,
    NULL              AS matched_employee_name,
    NULL              AS match_confidence
FROM users u
WHERE u.employee_id IS NULL
  AND u.role != 'SUPER_ADMIN'
ORDER BY u.tenant_id, u.role, u.email;

-- 3. SUPER_ADMIN users that incorrectly have a non-null employee_id (should be zero rows)
SELECT
    id AS user_id,
    tenant_id,
    email,
    employee_id
FROM users
WHERE role = 'SUPER_ADMIN'
  AND employee_id IS NOT NULL;

-- 4. Count of users by tenant with null employee_id (helps prioritise backfill work)
SELECT
    tenant_id,
    COUNT(*) AS null_employee_id_count
FROM users
WHERE employee_id IS NULL
  AND role != 'SUPER_ADMIN'
GROUP BY tenant_id
ORDER BY null_employee_id_count DESC;
