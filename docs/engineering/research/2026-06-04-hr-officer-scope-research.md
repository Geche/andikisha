# HR_OFFICER Scope Research — 2026-06-04

## Summary

The evidence points to **Recommendation Shape A**: HR_OFFICER is a named V1 authority role that is explicitly expected by product planning documents to have broad (`ALL`) scope and `employee:write` capability, but its permission rows were never seeded in the Flyway migration that defines all other roles. The silent `OWN` default in `CallerScopeResolver` is a gap, not an intention. A second structural issue emerges from the research: there is also a legacy `HR` role (no `_MANAGER` or `_OFFICER` suffix) that has seed data, appears in `@PreAuthorize` checks, and is mapped to `ALL` scope in the resolvers — but `HR` does not appear in the `Role` enum. These two facts together suggest that `HR_OFFICER` is the intended modern name for what `HR` currently does, and the implementation simply never caught up with the naming.

---

## Evidence gathered

### 1. Role enum and inline documentation

**File:** `services/auth-service/src/main/java/com/andikisha/auth/domain/model/Role.java:11`

```java
// HR & Administration
ADMIN,
HR_MANAGER,
HR_OFFICER,
```

`HR_OFFICER` is grouped under "HR & Administration" alongside `HR_MANAGER` and `ADMIN`. There is no Javadoc or comment on the `HR_OFFICER` value itself — no statement of intent. `HR` (without suffix) does **not** appear in the enum at all.

---

### 2. role_permissions seed data

**File:** `services/auth-service/src/main/resources/db/migration/V6__seed_role_permissions.sql`

The migration seeds five roles: `HR_MANAGER`, `PAYROLL_OFFICER`, `HR`, `LINE_MANAGER`, `EMPLOYEE`. **HR_OFFICER has zero rows.** There is no INSERT block for HR_OFFICER and no comment explaining the omission.

The `HR` role (which has no match in the enum) is seeded with:
```sql
-- HR: Employee management and leave, no payroll processing
employee:create:all
employee:read:all
employee:update:all
leave:read:all
leave:approve:all
report:read:all
```

**Live database confirmation** (`role_permissions` table, `andikisha_auth`):
```
 role | resource | action  | scope
------+----------+---------+-------
(0 rows)   ← for HR_OFFICER
```

The `HR` role rows do exist in the DB, seeded from V6.

---

### 3. Hardcoded scope mapping in CallerScopeResolver

**employee-service** (`services/employee-service/.../CallerScopeResolver.java:22–25`):
```java
// Scope mapping (employee resource, matches V14 seed):
//   HR_MANAGER, HR, PAYROLL_OFFICER → ALL
//   LINE_MANAGER                    → DEPARTMENT
//   EMPLOYEE, other                 → OWN
ScopeType scopeType = switch (role == null ? "" : role) {
    case "HR_MANAGER", "HR", "PAYROLL_OFFICER" -> ScopeType.ALL;
    case "LINE_MANAGER" -> ScopeType.DEPARTMENT;
    default -> ScopeType.OWN;
};
```

**leave-service** (`services/leave-service/.../CallerScopeResolver.java:21–25`):
```java
// Scope mapping (leave resource, matches V14 seed):
//   HR_MANAGER, HR → ALL
//   LINE_MANAGER    → DEPARTMENT
//   EMPLOYEE, other → OWN
ScopeType scopeType = switch (role == null ? "" : role) {
    case "HR_MANAGER", "HR" -> ScopeType.ALL;
    case "LINE_MANAGER" -> ScopeType.DEPARTMENT;
    default -> ScopeType.OWN;
};
```

**Key observations:**
- `HR` (no suffix) is explicitly listed in both resolvers as `→ ALL`. This matches the V6 seed data.
- `HR_OFFICER` is absent from both switch statements. No comment explains the absence — not even a `// reserved` note.
- The comment says "matches V14 seed" — `V14` is the employee-id constraint migration; the intended reference was likely to the V6 role_permissions seed. The mismatch in the comment is itself a minor evidence point that the resolver was written without full visibility into the V6 seed.

---

### 4. Code references to HR_OFFICER

| File:Line | Classification | Snippet |
|-----------|----------------|---------|
| `auth-service/…/Role.java:11` | Listing only | `HR_OFFICER,` in enum under "HR & Administration" |
| `employee-service/…/BulkUploadService.java:57` | Listing only | `List.of("EMPLOYEE", "HR_OFFICER", "PAYROLL_OFFICER", "HR_MANAGER", "LINE_MANAGER")` — ALLOWED_ROLES for bulk upload |
| `employee-service/…/BulkUploadService.java:126` | Listing only | Excel template hint: `"EMPLOYEE | HR_OFFICER | PAYROLL_OFFICER | HR_MANAGER | LINE_MANAGER"` |
| `tenant-portal/…/[employeeId]/page.tsx:65` | Listing only | `{ value: "HR_OFFICER", label: "HR Officer" }` in role-change dropdown |
| `docs/plans/2026-05-22-role-permissions-onboarding-plan.md:31` | Documentation — authority definition | **"Five authority roles: ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE."** HR_OFFICER is one of the explicitly named V1 roles. |
| `docs/plans/2026-05-22-role-permissions-onboarding-plan.md:155` | Documentation — assumed capability | **"only ADMIN, HR_MANAGER, HR_OFFICER (whoever has `employee:write` capability)"** — assumes HR_OFFICER has `employee:write`. |
| `docs/archive/2026-05-22-role-permissions-onboarding-execution-prompt.md:18` | Documentation — authority definition | **"Five authority roles in scope: ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE."** Same statement in the implementation guide. |
| `docs/archive/2026-05-22-role-permissions-onboarding-execution-prompt.md:131` | Documentation — UI spec | HR_OFFICER in the role-assignment dropdown, "explicitly not ADMIN, SUPER_ADMIN, or any deprecated role" — HR_OFFICER is implicitly non-deprecated. |
| `docs/archive/2026-05-22-role-permissions-onboarding-execution-prompt.md:208` | Documentation — access control spec | **"Confirm the existing `PATCH /api/v1/employees/{id}` is correctly gated to roles with `employee:write` capability (ADMIN, HR_MANAGER, HR_OFFICER)."** Explicitly expects HR_OFFICER to have write capability on employees. |
| `docs/archive/2026-05-22-role-permissions-onboarding-execution-prompt.md:251` | Documentation — validation rule | HR_OFFICER as valid assignable role in bulk upload. |
| `docs/product/andikishaHR-report-02-release-02-new-services.md:124` | Documentation — product target user | **"HR Managers and HR Officers (manage the full pipeline and configure workflows)"** — positions HR Officer as an operator of the full HR pipeline. |
| `docs/architecture/2026-05-06-production-readiness-review.md:116` | Documentation — prior audit finding | Lists HR_OFFICER among roles "defined" but with no `@PreAuthorize` coverage. Flagged as finding m-CQ-2 in a prior code review. |

No reference found anywhere that classifies HR_OFFICER as narrow-scope, self-service-only, or deprecated.

---

### 5. Product planning document references

**Source 1:** `docs/plans/2026-05-22-role-permissions-onboarding-plan.md`

Section heading "Locked decisions feeding this plan", item 2 (verbatim):
> **Five authority roles:** ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE. (Existing system already has these and others; we use the documented set and treat extras as deprecated for V1.)

Section 5.3 (verbatim):
> The HR-side employee edit screen (existing) can edit tier-two fields. Gate this with the existing role permissions — only ADMIN, HR_MANAGER, HR_OFFICER (whoever has `employee:write` capability). Don't add a request-and-approve workflow; HR edits directly.

This is the most direct product-level statement about HR_OFFICER: it is expected to have `employee:write` capability, which in the permissions model means `employee:update:all` (the SYSTEM seed action for writing employees across all records in the tenant). This assumption was never satisfied because no HR_OFFICER seed rows exist.

**Source 2:** `docs/archive/2026-05-22-role-permissions-onboarding-execution-prompt.md`

Section 2 (verbatim):
> Five authority roles in scope: ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE.

Section 5.3 (verbatim):
> Confirm the existing `PATCH /api/v1/employees/{id}` is correctly gated to roles with `employee:write` capability (ADMIN, HR_MANAGER, HR_OFFICER). If not, fix the gate.

**Source 3:** `docs/product/andikishaHR-report-02-release-02-new-services.md:124` (verbatim):
> HR Managers and HR Officers (manage the full pipeline and configure workflows)

This places HR Officers in the "manager" tier of HR users, not the self-service tier.

**Source 4:** `docs/architecture/2026-05-06-production-readiness-review.md` (verbatim, finding m-CQ-2):
> **Roles defined:** `HR_OFFICER`, `PAYROLL_MANAGER`, `PAYROLL_OFFICER`, `FINANCE_OFFICER`, `CHIEF_MANAGER`, `CHIEF_OFFICER`, `AUDITOR`, `LINE_MANAGER`
> **Roles used in `@PreAuthorize`:** `ADMIN`, `HR_MANAGER`, `HR`, `MANAGER`, `EMPLOYEE`, `SUPER_ADMIN`
> **Problem:** Eight roles exist in the enum but are never checked in any `@PreAuthorize` annotation.

This is a prior audit finding that identified the gap. The reviewer noted it as a problem to fix, not a deliberate design choice.

---

### 6. Peer role comparison

| Role | Seed data exists? | CallerScopeResolver mapping | Sample @PreAuthorize usage |
|------|------------------|-----------------------------|---------------------------|
| `HR_MANAGER` | ✅ Yes | `ALL` (both resolvers) | `employee:read:all`, `employee:create:all`, `employee:update:all`, `employee:delete:all`, `payroll:read:all`, `payroll:approve:all`, `leave:read:all`, `leave:approve:all`, `user:manage:all` |
| `HR` (legacy) | ✅ Yes | `ALL` (both resolvers) | `employee:create:all`, `employee:read:all`, `employee:update:all`, `leave:read:all`, `leave:approve:all`, `report:read:all` — same as HR_MANAGER but without payroll and user management |
| `HR_OFFICER` | ❌ No rows | Falls to `OWN` (default) | Zero — absent from all @PreAuthorize checks |
| `PAYROLL_OFFICER` | ✅ Yes | `ALL` (employee resolver only) | `employee:read:all`, `payroll:create:all`, `payroll:process:all`, `payroll:read:all`, `report:read:all` |
| `LINE_MANAGER` | ✅ Yes | `DEPARTMENT` | `employee:read:department`, `leave:read:department`, `leave:approve:department`, `report:read:department` |
| `EMPLOYEE` | ✅ Yes | `OWN` | `employee:read:own`, `employee:update:own`, `payroll:read:own`, `leave:create:own`, `leave:read:own` |

**The `HR` / `HR_OFFICER` relationship:** `HR` is an unlisted role (not in the enum) that was seeded with a permission set nearly identical to what HR_OFFICER is expected to have per the planning docs. The enum places `HR_OFFICER` where `HR` logically belongs. The strong inference is that `HR_OFFICER` is the intended enum name for the legacy `HR` concept, and the implementation lag caused `HR_OFFICER` to never receive the seed rows that `HR` holds.

---

## Recommendation

**Recommendation shape: A**

### What the recommendation is

Add `HR_OFFICER` to the SYSTEM tenant's `role_permissions` seed data with the same permission set as the existing `HR` legacy role: `employee:read:all`, `employee:create:all`, `employee:update:all`, `leave:read:all`, `leave:approve:all`, `report:read:all`. Add `HR_OFFICER` to both `CallerScopeResolver` switch statements as `ALL` scope. Add `HR_OFFICER` to the `@PreAuthorize` expressions on endpoints that already include `HR` — specifically the employee-read, employee-update, and leave-read/approve endpoints.

### Why the evidence supports it

**The planning documents are unambiguous.** The onboarding plan names HR_OFFICER as one of five V1 authority roles and explicitly states "ADMIN, HR_MANAGER, HR_OFFICER (whoever has `employee:write` capability)" in §5.3. A role cannot have `employee:write` capability while being silently resolved to `OWN` scope. The plan assumed this would be wired up; it wasn't.

**The legacy `HR` role demonstrates the intended pattern.** The `HR` role (not in the enum, but seeded and active) has broad all-scope permissions matching what the product documentation says HR_OFFICER should do. The enum groups `HR_OFFICER` alongside `HR_MANAGER` under "HR & Administration," not under "Self-service." The naming pattern strongly suggests `HR_OFFICER` is the intended enum-level name for what `HR` currently is.

**The absence of seed data is a gap, not a decision.** The V6 migration seeds `HR` but has no block for `HR_OFFICER` and no comment explaining why. In the same file, `PAYROLL_OFFICER` gets full seed data and a descriptive comment. If `HR_OFFICER` were intentionally narrow-scoped, V6 would either have an entry with `:own` scope rows or a comment saying "HR_OFFICER: no permissions assigned, self-service only." Neither exists.

**Prior code review flagged this as a problem.** The REVIEW_REPORT.md finding m-CQ-2 listed HR_OFFICER as one of eight roles that exist in the enum but have no `@PreAuthorize` coverage — explicitly classified as a problem, not an intentional design. The recommended fix was to "wire the missing roles into `@PreAuthorize` expressions."

### What the M-3 fix would look like under this recommendation

Three changes, all additive:

1. **New Flyway migration** (V15 or next available): Insert `role_permissions` rows for HR_OFFICER in the SYSTEM tenant, matching the `HR` legacy role's permission set (`employee:read:all`, `employee:create:all`, `employee:update:all`, `leave:read:all`, `leave:approve:all`, `report:read:all`). Does not touch existing data.

2. **Both `CallerScopeResolver` switch statements**: Add `"HR_OFFICER"` to the `ALL` branch, alongside `"HR_MANAGER"` and `"HR"`. Also add `log.warn("Unknown role '{}' defaulting to OWN scope", role)` to the default case so future gaps surface immediately.

3. **Existing `@PreAuthorize` expressions** that reference `HR`: Add `HR_OFFICER` to any expression that currently includes `HR` for HR-domain endpoints (employee CRUD, leave read/approve). The exact set requires reading each endpoint's current expression, but the pattern is: anywhere `HR` appears in an HR-domain `@PreAuthorize`, `HR_OFFICER` should appear alongside it.

### Risks or open questions

**1. The `HR` legacy role is a separate, unresolved question.** `HR` does not appear in the `Role` enum but has live seed data and @PreAuthorize usage. If HR_OFFICER is added with the same permission set as `HR`, the system will have two functionally identical roles — one assignable (HR_OFFICER), one unreachable via normal assignment flows (HR). A follow-up decision is needed: either deprecate `HR` and migrate any existing HR-role users to HR_OFFICER, or clarify that `HR` is retained for a different purpose. This is out of scope for M-3 but should be noted.

**2. Should HR_OFFICER have the same permissions as `HR` or a subset?** The planning docs say HR_OFFICER has `employee:write` capability, which matches `HR`. But if the intent is that HR_OFFICER is a slightly more restricted version (e.g., no leave approval, no employee creation), the fix should implement that subset. The evidence does not clearly distinguish — the plan in §5.3 mentions write capability specifically, not the full `HR` permission set. A human decision is needed on whether to clone `HR`'s permissions exactly or define a narrower set.

**3. The EmployeeController `create` and `delete` endpoints** are currently gated to `hasAnyRole('HR_MANAGER', 'ADMIN')` with no `HR` or `HR_OFFICER`. If HR_OFFICER is intended to match `HR`, it would also gain create access — but the current @PreAuthorize expressions don't include `HR` on those endpoints either. This inconsistency between what `HR` is supposed to do (V6 seeds `employee:create:all`) and what the controller allows (only `HR_MANAGER` and `ADMIN`) should be resolved at the same time. For M-3, the safe choice is to match existing behavior: add HR_OFFICER to the endpoints where `HR` already appears, and leave the `HR_MANAGER`-only endpoints for a separate pass.
