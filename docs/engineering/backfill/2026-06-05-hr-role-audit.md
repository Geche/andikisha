# HR Role User Audit — 2026-06-05

**Purpose:** Pre-migration audit of users assigned `role = 'HR'` before V15 data migration (HR → HR_OFFICER rename).  
**Query run against:** `andikisha-postgres-auth` → `andikisha_auth.users`  
**Date:** 2026-06-05

## Query executed

```sql
SELECT u.id, u.email, u.tenant_id, u.role, u.created_at, u.last_login
FROM users u
WHERE u.role = 'HR'
ORDER BY u.tenant_id, u.created_at;
```

## Result

```
 id | email | tenant_id | role | created_at | last_login
----+-------+-----------+------+------------+------------
(0 rows)
```

## Summary

**Total HR-assigned users: 0**

No users currently hold the HR role in any tenant. The V15 data migration (`UPDATE users SET role = 'HR_OFFICER' WHERE role = 'HR'`) is a no-op against live data but is included in the migration file for:
1. Future-proofing: fresh installs will never get HR-role users, but this ensures any future gap is closed atomically.
2. Symmetry: the migration should be complete and self-contained.

## Flags for manual review

None. Zero rows means there are no edge cases (system accounts, test accounts, ambiguous assignments) to investigate.

## Decision

No manual review required before proceeding with V15. The migration runs as written.
