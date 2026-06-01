# Null employee_id Backfill Audit

**Date:** 2026-05-31
**Environment:** Dev (local Docker)
**Database:** `andikisha-postgres-auth` — `andikisha_auth`
**Run by:** Lawrence Chege
**Policy:** Report-only. No auto-linking. Ambiguous cases flagged for manual review.

---

## Query 1 — Summary by role

| Role | Total users | null employee_id | Has employee_id |
|------|-------------|-----------------|-----------------|
| ADMIN | 3 | 3 | 0 |
| EMPLOYEE | 29 | 26 | 3 |
| SUPER_ADMIN | 1 | 1 | 0 |
| **Total** | **33** | **29** | **4** |

---

## Query 3 — SUPER_ADMIN with non-null employee_id (design violation)

**0 rows. No violation.** SUPER_ADMIN correctly has null `employee_id`.

---

## Query 2 — Non-SUPER_ADMIN users with null employee_id (29 rows)

### ADMINs — 3 rows (expected; see policy note)

| User ID | Tenant | Email | Created | Last login |
|---------|--------|-------|---------|------------|
| `73352232-...` | `05b64187-...` | admin@polcacreations.com | 2026-05-19 | never |
| `77676573-...` | `1cc12430-...` | admin@demo.co.ke | 2026-05-11 | 2026-05-22 |
| `0687c72c-...` | `81721f27-...` | admin@nireen.com | 2026-05-19 | 2026-05-20 |

**Assessment:** All three are tenant-provisioned ADMINs. No employee records exist for these users in employee-service (confirmed by cross-join on tenants `05b64187`, `81721f27`). These are expected nulls under the ADMIN provisioning exception. The `EmployeeCreatedListener` auto-link will fire when each admin creates their own employee record.

**Action required:** None. Monitor via gateway warning logs.

---

### EMPLOYEEs — 26 rows

#### HIGH confidence matches (25 rows) — unique email match in employee-service

Cross-referenced `users.email` against `employees.email` within the same tenant. All 25 below have exactly one match.

| User email | Tenant | Match employee ID | Employee name | Employee # |
|------------|--------|-------------------|---------------|------------|
| amara.kamau@demo.co.ke | `1cc12430...` | `d23161d6-...` | Amara Kamau | EMP-0028 |
| chegzlaw@gmail.com | `1cc12430...` | `7af7992f-...` | Lawrence Chege | EMP-0029 |
| david.ochieng@demo.co.ke | `1cc12430...` | `b99b2927-...` | David Ochieng | EMP-0027 |
| seed10@demo.co.ke | `1cc12430...` | `e6dc1450-...` | Alice Kamau | EMP-0005 |
| seed11@demo.co.ke | `1cc12430...` | `743c3830-...` | Bob Njeri | EMP-0006 |
| seed12@demo.co.ke | `1cc12430...` | `b172186c-...` | Carol Odhiambo | EMP-0007 |
| seed13@demo.co.ke | `1cc12430...` | `07ad4ca9-...` | David Wanjiku | EMP-0008 |
| seed14@demo.co.ke | `1cc12430...` | `37a186db-...` | Eve Kipchoge | EMP-0009 |
| seed15@demo.co.ke | `1cc12430...` | `7782c6f5-...` | Frank Achieng | EMP-0010 |
| seed16@demo.co.ke | `1cc12430...` | `f457e0cd-...` | Grace Mwangi | EMP-0011 |
| seed17@demo.co.ke | `1cc12430...` | `341620ad-...` | Henry Otieno | EMP-0012 |
| seed18@demo.co.ke | `1cc12430...` | `e10f4a1d-...` | Iris Wambua | EMP-0013 |
| seed19@demo.co.ke | `1cc12430...` | `6b35debc-...` | James Ndungu | EMP-0014 |
| seed20@demo.co.ke | `1cc12430...` | `4b560a32-...` | Kate Mutua | EMP-0015 |
| seed21@demo.co.ke | `1cc12430...` | `7b150c95-...` | Liam Karanja | EMP-0016 |
| seed22@demo.co.ke | `1cc12430...` | `1e657457-...` | Mary Kimani | EMP-0017 |
| seed23@demo.co.ke | `1cc12430...` | `36d439e4-...` | Noah Omollo | EMP-0018 |
| seed24@demo.co.ke | `1cc12430...` | `57cc14ff-...` | Olivia Gitau | EMP-0019 |
| seed25@demo.co.ke | `1cc12430...` | `5da40715-...` | Peter Kamau | EMP-0020 |
| seed26@demo.co.ke | `1cc12430...` | `24808267-...` | Quinn Njeri | EMP-0021 |
| seed27@demo.co.ke | `1cc12430...` | `ad65e268-...` | Rose Odhiambo | EMP-0022 |
| seed28@demo.co.ke | `1cc12430...` | `3ad23a90-...` | Sam Wanjiku | EMP-0023 |
| seed29@demo.co.ke | `1cc12430...` | `bbf1963f-...` | Tina Kipchoge | EMP-0024 |
| seed30@demo.co.ke | `1cc12430...` | `5f5a7363-...` | Uma Achieng | EMP-0025 |
| seed31@demo.co.ke | `1cc12430...` | `c6865164-...` | Victor Mwangi | EMP-0026 |

**Root cause:** These users were created by the old seed script directly into the `users` table, bypassing the `EmployeeCreatedEvent` flow. The `EmployeeCreatedListener` was not running (or the event was not published) at seed time, so `employee_id` was never set.

**Action required:** Present to Lawrence for sign-off, then manually link with:
```sql
-- Run per row after Lawrence confirms. DO NOT execute in bulk without review.
UPDATE users SET employee_id = '<employee_id>' WHERE id = '<user_id>' AND tenant_id = '<tenant_id>';
```

#### LOW confidence — no employee match found (1 row)

| User ID | Tenant | Email | Role | Active | Created |
|---------|--------|-------|------|--------|---------|
| `20030091-...` | `43950c73-...` | hr@acmekenya.co.ke | EMPLOYEE | true | 2026-05-11 |

**Assessment:** No employee record found in employee-service for this tenant. Either (a) the employee record was never created, (b) the employee record was deleted, or (c) this is a ghost/test account. Tenant `43950c73-acbf-414a-a910-acafecdfce3d` appears to be the Acme Kenya test tenant from early dev.

**Action required:** Verify if this tenant and user are still in use. If not, deactivate. Do not auto-link. This user cannot use any scope-enforced endpoint after Step 2 until linked.

---

## Query 4 — Null employee_id count by tenant

| Tenant ID | Null count |
|-----------|-----------|
| `1cc12430-7c3a-45b7-8973-469622778c9d` (demo.co.ke) | 26 |
| `05b64187-6d14-4010-8a91-dd9e358db968` (polcacreations.com) | 1 |
| `81721f27-5cc1-4b01-b20f-8b5bd8ffe750` (nireen.com) | 1 |
| `43950c73-acbf-414a-a910-acafecdfce3d` (acmekenya.co.ke) | 1 |

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| SUPER_ADMIN violations (non-null employee_id) | 0 | None — clean |
| ADMIN null (expected) | 3 | None — auto-link on employee record creation |
| EMPLOYEE HIGH confidence match | 25 | Manual link after Lawrence sign-off |
| EMPLOYEE LOW confidence (no match) | 1 | Investigate hr@acmekenya.co.ke |

**Nothing unexpected.** No SUPER_ADMIN violations. All ADMIN nulls are expected. All EMPLOYEE nulls are explainable (seed script bypass or orphan test account). Dev data only — no production impact.

---

## Remediation policy (locked decision 11)

- **HIGH confidence match:** Present to Lawrence for manual confirmation before linking. Do NOT auto-link.
- **LOW confidence:** Flag for investigation. No action without explicit confirmation.
- **SUPER_ADMIN with non-null employee_id:** Not present. If found in future, clear manually after investigation.
- **ADMIN with null employee_id:** Expected at provisioning time. Auto-linked by `EmployeeCreatedListener` when admin creates employee record.

---

---

## Remediation Actions

**Executed: 2026-05-31 by Lawrence Chege (confirmed and directed)**

### Action 1 — Link 25 HIGH-confidence rows

Executed as a single `BEGIN … COMMIT` transaction against `andikisha_auth`.
Each UPDATE was guarded with `AND employee_id IS NULL` to prevent overwriting any existing link.
All 25 rows returned `UPDATE 1`. No conflicts.

```sql
-- Single transaction. All 25 rows. tenant: 1cc12430-7c3a-45b7-8973-469622778c9d
UPDATE users SET employee_id = 'd23161d6-0cd1-428f-a1c9-31933f45d2ee', updated_at = NOW() WHERE id = 'ea9277c3-bfd3-43b5-abe7-63884fe28df3' AND employee_id IS NULL; -- amara.kamau@demo.co.ke
UPDATE users SET employee_id = '7af7992f-08ea-4429-89de-7709f873b4c3', updated_at = NOW() WHERE id = 'b8a2f8c6-5be7-41ac-8140-092da241d0d0' AND employee_id IS NULL; -- chegzlaw@gmail.com
UPDATE users SET employee_id = 'b99b2927-24e3-4c2f-a84b-6c614b5b6d4d', updated_at = NOW() WHERE id = '1048d338-35ca-4082-843b-c894a3ff87da' AND employee_id IS NULL; -- david.ochieng@demo.co.ke
UPDATE users SET employee_id = 'e6dc1450-e34e-4a3d-bfd0-3eeaa559f0ff', updated_at = NOW() WHERE id = '64610109-d7fd-4efb-a564-817893d200f5' AND employee_id IS NULL; -- seed10
UPDATE users SET employee_id = '743c3830-47e5-4033-ad71-5c7120674ee8', updated_at = NOW() WHERE id = '48bfc480-8fe0-40b2-b1a4-89c4262f9c2d' AND employee_id IS NULL; -- seed11
UPDATE users SET employee_id = 'b172186c-fa32-43bb-aa45-225282e94bfc', updated_at = NOW() WHERE id = '158b6fc4-60a4-4307-b336-0938c4a261d6' AND employee_id IS NULL; -- seed12
UPDATE users SET employee_id = '07ad4ca9-b462-4b64-adfa-c09258b402eb', updated_at = NOW() WHERE id = '2146f678-9c45-4f8f-a013-7cbc09ae5564' AND employee_id IS NULL; -- seed13
UPDATE users SET employee_id = '37a186db-c6af-4dea-839c-d48fb38a92b7', updated_at = NOW() WHERE id = '342f981a-45fb-4add-aa27-2bb6ef7b92d2' AND employee_id IS NULL; -- seed14
UPDATE users SET employee_id = '7782c6f5-7a15-44da-8610-1675786f004b', updated_at = NOW() WHERE id = 'db111e82-c41b-4274-a5c1-a36131fcb5a7' AND employee_id IS NULL; -- seed15
UPDATE users SET employee_id = 'f457e0cd-d6af-4654-9b69-c1e3ad249dac', updated_at = NOW() WHERE id = '21226777-512a-4544-b0af-2aaf5187ea13' AND employee_id IS NULL; -- seed16
UPDATE users SET employee_id = '341620ad-691e-4449-ae63-0bb762f500cc', updated_at = NOW() WHERE id = '58ef4406-ae18-498f-86f9-bb98082946bb' AND employee_id IS NULL; -- seed17
UPDATE users SET employee_id = 'e10f4a1d-485a-48b8-b043-547930ec9ee8', updated_at = NOW() WHERE id = 'eb1a5cc4-09a7-4b5a-92b9-9fe86cb37f8a' AND employee_id IS NULL; -- seed18
UPDATE users SET employee_id = '6b35debc-aacc-40fa-8cfd-98361404ffc8', updated_at = NOW() WHERE id = 'b25bc1ca-6207-4544-9301-1544a75c8f6e' AND employee_id IS NULL; -- seed19
UPDATE users SET employee_id = '4b560a32-f7bd-407e-ab59-6ed73042e713', updated_at = NOW() WHERE id = '06aa0945-55ed-4efe-a797-b0f2115abc43' AND employee_id IS NULL; -- seed20
UPDATE users SET employee_id = '7b150c95-2302-4e1c-9677-b984712b7bc0', updated_at = NOW() WHERE id = 'a7307896-a0b6-48a5-851d-ec398f13d307' AND employee_id IS NULL; -- seed21
UPDATE users SET employee_id = '1e657457-61b5-43d8-a0ca-00e6cac235e3', updated_at = NOW() WHERE id = '31e80680-f90f-4788-b97f-7935805e623d' AND employee_id IS NULL; -- seed22
UPDATE users SET employee_id = '36d439e4-a710-496b-9039-042a4e7ee9b3', updated_at = NOW() WHERE id = 'fa3e990e-c4ca-4bfe-8047-76438be3884f' AND employee_id IS NULL; -- seed23
UPDATE users SET employee_id = '57cc14ff-95ed-4fec-8b04-54ae8b76395e', updated_at = NOW() WHERE id = 'cb19aa18-7894-4bb8-b076-9f4ab7e51213' AND employee_id IS NULL; -- seed24
UPDATE users SET employee_id = '5da40715-910d-4aec-aaea-e03802594f28', updated_at = NOW() WHERE id = '98daa9f2-a220-4351-9b4f-2e2aeed0435e' AND employee_id IS NULL; -- seed25
UPDATE users SET employee_id = '24808267-0338-4fbc-9c33-894194898c32', updated_at = NOW() WHERE id = 'f303db30-12a8-4a43-b09f-dca675d541dc' AND employee_id IS NULL; -- seed26
UPDATE users SET employee_id = 'ad65e268-ff61-4f05-8ba1-bf1ba13bd7c9', updated_at = NOW() WHERE id = '755a92a0-3d9f-41fb-9c26-7dfd2d9d7838' AND employee_id IS NULL; -- seed27
UPDATE users SET employee_id = '3ad23a90-7712-4462-a859-0bb8b28bfc0a', updated_at = NOW() WHERE id = 'dd25efec-4a7b-4005-b00a-3728ec5f8596' AND employee_id IS NULL; -- seed28
UPDATE users SET employee_id = 'bbf1963f-beb4-4ac3-8a03-16c3e94cb10b', updated_at = NOW() WHERE id = '2f5de146-3967-4d98-b736-d6ef85528323' AND employee_id IS NULL; -- seed29
UPDATE users SET employee_id = '5f5a7363-2113-4057-97b9-fd985e98cd66', updated_at = NOW() WHERE id = 'fe12ea49-217c-40fa-ab71-c63d9f6424ca' AND employee_id IS NULL; -- seed30
UPDATE users SET employee_id = 'c6865164-6681-46a4-9bec-3891431e2d92', updated_at = NOW() WHERE id = '15924315-6b25-4dcd-8ec4-39ea086960e5' AND employee_id IS NULL; -- seed31
```

**Result:** 25/25 `UPDATE 1`. All rows committed successfully.

---

### Action 2 — Delete LOW-confidence stale dev artifact

**User:** `hr@acmekenya.co.ke` (user_id: `20030091-41e0-4035-917b-f47a182420d7`)

**Investigation findings:**
- Created: 2026-05-11 11:41:46 — same second as the Acme Kenya tenant itself (tenant created 11:41:45)
- `last_login`: NULL — never logged in after registration
- Only refresh token: created at registration time, expired 2026-05-18, already `revoked = true`
- No employee record in employee-service for tenant `43950c73-acbf-414a-a910-acafecdfce3d`
- Only user in the tenant — the tenant `admin_email` is `hr@acmekenya.co.ke` but the user has role `EMPLOYEE`, not `ADMIN`
- **Diagnosis:** User self-registered via `POST /auth/register` on the same day the Acme Kenya test tenant was created. The registration generated a refresh token (standard flow) but the user never returned. The Acme Kenya tenant was a dev test created on 2026-05-11 and never used. Classic half-created test scenario — auth-side succeeded, employee-side was never created.

**Deletion rationale:** Never logged in. Refresh token expired and revoked. No employee record. No activity. Pure dev artifact predating user-to-employee link enforcement.

```sql
BEGIN;
DELETE FROM refresh_tokens WHERE user_id = '20030091-41e0-4035-917b-f47a182420d7';
DELETE FROM users WHERE id = '20030091-41e0-4035-917b-f47a182420d7' AND last_login IS NULL;
COMMIT;
```

**Result:** `DELETE 1` (refresh_tokens), `DELETE 1` (users). Committed.

---

## Final audit counts (post-remediation, 2026-05-31)

### Q1 — Summary by role

| Role | Total users | null employee_id | Has employee_id |
|------|-------------|-----------------|-----------------|
| ADMIN | 3 | 3 | 0 |
| EMPLOYEE | 28 | **0** | 28 |
| SUPER_ADMIN | 1 | 1 | 0 |

### Q3 — SUPER_ADMIN violations

**0 rows.** Clean.

### Q2 — Remaining non-SUPER_ADMIN nulls

| Email | Role | Tenant |
|-------|------|--------|
| admin@demo.co.ke | ADMIN | `1cc12430-...` |
| admin@nireen.com | ADMIN | `81721f27-...` |
| admin@polcacreations.com | ADMIN | `05b64187-...` |

All three are expected ADMIN provisioning-exception rows. No EMPLOYEE nulls remain.

### Q4 — Null count by tenant

| Tenant | Null count |
|--------|-----------|
| `1cc12430-...` (demo.co.ke) | 1 (admin@demo.co.ke — expected) |
| `81721f27-...` (nireen.com) | 1 (admin@nireen.com — expected) |
| `05b64187-...` (polcacreations.com) | 1 (admin@polcacreations.com — expected) |

**Final state: clean.** Zero EMPLOYEE or operational-role users with null `employee_id`. Three ADMIN rows remain as documented chicken-and-egg exceptions. AUTH-BACKLOG-004 tracks the `VALIDATE CONSTRAINT` upgrade once those three are resolved.
