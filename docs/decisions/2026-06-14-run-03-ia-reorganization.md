# Tenant-portal admin IA reorganization (R3-1)

**Date:** 2026-06-14
**Run:** Remediation Run 03, workstream R3-1 (+ R3-3 folded)
**Status:** Decided and implemented. Browser/HTTP checkpoint passed.
**Branch:** `fix/ux-flow-remediation-03` (depends on R3-0 `ca2e936`)

## Context

The tenant-portal admin information architecture had grown ad-hoc: people/role
management sat in an "Administration" group, while the structural surfaces
(departments, positions) were buried two clicks deep inside a Settings hub that
also advertised a "Roles & permissions" card which only *redirected* to the user
screen. "My profile" sat in the admin nav footer but pointed into the `(my)`
route group. The Phase-A audit proposed organising the admin IA around three
semantic categories. This doc records the model chosen and the cosmetic regroup
shipped.

## Three-categories evidence and the refined model

The starting hypothesis was **Access / Workspace / My profile**. The audit
confirmed the first two but refined the third:

- **Access** — who can log in and what they may do. `/admin/users` already *is*
  the consolidated People + Roles + Permission-matrix surface (R2-10 collapsed the
  old duplicate). Clean fit.
- **Workspace** — how the company is structured: departments + positions. Clean fit.
- **My profile is not an admin-IA category.** It lives in the `(my)` route group
  (employee self-service, `/api/v1/employees/me`). Listing it as a peer of Access/
  Workspace conflated two route groups. It belongs in a user menu, not the admin nav.
- **A fourth need surfaced:** integrations and billing fit neither Access nor
  Workspace; forcing them into Workspace would make it a junk drawer.

**Chosen model:** **Access / Workspace / Settings**, with **My profile** relocated to
a user-menu chip. Settings is restored to its proper role — the home for tenant
configuration, integrations, billing, notification preferences, and statutory
defaults (future surfaces) — rather than a container for structural screens.

**Label decisions (approved):** "Settings" (not "Configuration" — SME admins look
for "Settings"; promoting Access/Workspace to first-class nav keeps Settings light).
"Workspace" (not "Organisation"). "Users & roles" (not "Users" — signals it holds the
permission matrix too).

## Cosmetic regroup — URLs unchanged

The reorganization is **navigation + hub structure only; every URL is unchanged.**
Departments stays at `/admin/settings/departments`, positions at
`/admin/settings/positions`, users at `/admin/users`. This avoids redirect debt and
deep-link breakage for zero functional cost. A future URL rename (e.g.
`/admin/users` → `/admin/access`) is filed as **TENANT-BACKLOG-010** for separate
consideration.

### Sidenav (implemented)

```
General      Dashboard
HR           Employees · Payroll · Leave
Operations   Time & attendance · Statutory filings · Analytics   (locked, unchanged)
Workspace    Departments · Positions                              (NEW group)
Access       Users & roles                                        (was "Administration"; nav-gated ADMIN|HR_MANAGER)
Footer       Settings · [user chip: name/email ▸ My profile · Sign out]
```

- **Per-item nav gating stays coarse** (backend enforces) except "Users & roles",
  which keeps its ADMIN|HR_MANAGER nav-hide. Finer per-item role-hiding is out of
  scope — deferred to AUTHZ-BACKLOG-001.
- **Settings hub** (`/admin/settings`) no longer shows Department/Position/Roles
  cards; it lists the upcoming config areas as "coming soon" so the category reads
  honestly.
- The **`/admin/settings/roles` redirect stub was deleted** (now 404); nothing links
  to it after the Settings card was removed.

### User-menu chip

The old footer (My profile / Settings / Sign out as flat items) is replaced by a
chip at the bottom of the sidebar: avatar + **display_name with email fallback**
(AUTH-006, surfaced via `/api/auth/me` → `fullName`), with **My profile**
(→ `/my/profile`) and **Sign out**. No top bar is introduced (`TenantAdminShell`
has no top bar by design).

## My-profile chip + gate split (R3-1 vs R3-2)

Shipping the chip's "My profile" link created a day-one problem: `/my/*` was
EMPLOYEE-gated, so a standalone (non-employee) admin — `admin@demo.co.ke` is one —
clicking the link bounced to `/access-denied`. To honour "no R3 workstream ships a
broken link," the gate relaxation is folded into R3-1; the heavier page-level work
stays in R3-2c:

- **R3-1 (here):** relax the `/my/*` gate from EMPLOYEE-only to **any authenticated
  user**, in both the edge middleware and the client `useRoleGuard("employee")`. The
  link no longer bounces. For users with no employee record, `/my/profile` currently
  renders its error state (not a crash, not a redirect) — acceptable for R3-1.
- **R3-2c (TENANT-006):** the `/my/profile` page itself handles a missing employee
  record gracefully — hide employee-specific sections (leave balance, attendance,
  payslips), show the user data that exists.

## R3-3 — position update endpoint (folded)

EMP-BACKLOG-003: departments had `PUT /api/v1/departments/{id}` but positions had no
update path. Added `PUT /api/v1/positions/{id}` (controller + `PositionService.update`
+ `UpdatePositionRequest`), mirroring departments exactly (ADMIN|HR_MANAGER;
`Position.update`, `PositionNotFoundException`, and `findByIdAndTenantId` already
existed). The positions settings page gained an edit affordance mirroring the
departments page (per-row pencil → unified create/update modal).

## Checkpoint (HTTP through real middleware + backend)

| Check | Result |
|---|---|
| ADMIN: all admin routes 200 at unchanged URLs | ✅ |
| `/admin/settings/roles` (deleted stub) | 404 ✅ |
| Sidenav: Workspace, Departments, Positions, Access, Users & roles, My profile, Sign out, Settings | all present ✅ |
| Settings hub: "coming soon" present; Roles/Departments/Positions cards + settings/roles link gone | ✅ |
| HR_MANAGER: "Users & roles" visible | ✅ |
| EMPLOYEE: `/admin/dashboard` → 307 → `/my/dashboard` | ✅ |
| Standalone admin: `/my/profile` → 200 (was 307 → /access-denied) | ✅ |
| Position PUT round-trip (edit → list reflects → restore) | ✅ MATCH |

Visual "console clean" and the sign-out click are the human browser pass (sign-out
reuses the unchanged `logout()` path).

## Follow-up

- **TENANT-BACKLOG-010** — optional URL rename (`/admin/users` → `/admin/access`, etc.).
- **AUTHZ-BACKLOG-001** — per-item nav role-hiding (kept coarse here).
- **R3-2c** — `/my/profile` graceful degradation for users without an employee record.
