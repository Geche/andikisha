# ADR 0001: Consolidate into a Single Tenant Portal

**Status**: Accepted  
**Date**: 2026-05-13  
**Authors**: Lawrence Chege  

---

## Context

AndikishaHR currently has two separate Next.js portal scaffolds:

- `frontend/admin-portal/` — for users with the `ADMIN` role, running on port 3000
- `frontend/employee-portal/` — for users with the `EMPLOYEE` role, running on port 3001

This two-app model was built during early scaffolding before the full role model was defined. The problem it creates:

**Five of seven defined roles have no portal to log into.**

The full role set is: `SUPER_ADMIN`, `ADMIN`, `HR_MANAGER`, `LINE_MANAGER`, `PAYROLL_OFFICER`, `HR`, `EMPLOYEE`.

Under the current model:
- `ADMIN` → admin-portal ✅
- `EMPLOYEE` → employee-portal ✅
- `HR_MANAGER` → no portal ❌
- `LINE_MANAGER` → no portal ❌
- `PAYROLL_OFFICER` → no portal ❌
- `HR` → no portal ❌
- `SUPER_ADMIN` → no portal (a separate `superadmin-portal` scaffold exists but is incomplete) ❌

Additionally, the existing `frontend/superadmin-portal/` directory is a leftover scaffold with no production intent. It will be deleted.

The two-portal model creates a structural dead-end. Adding the five stranded roles would require either building two more apps (compounding the problem) or breaking the clean ADMIN/EMPLOYEE split (defeating the purpose of separation). Multi-role users — a user who is both `EMPLOYEE` and `HR_MANAGER`, for example — have no coherent home.

The audit (`../audits/2026-05-13-tenant-portal-consolidation-audit.md`, 2026-05-13) confirmed the two scaffolds share identical auth flows, state management patterns, styling systems, and shared package consumption. Merging them carries low technical risk.

---

## Decision

**Consolidate `admin-portal` and `employee-portal` into a single Next.js 15 app at `frontend/tenant-portal/`.**

This app is the customer-facing surface of AndikishaHR — used by every role that belongs to a tenant organisation. It runs on port 3000.

Routes are organised into two path-scoped segments using Next.js App Router route groups:

- **`/my/*`** — employee self-service. Used by `EMPLOYEE`, `LINE_MANAGER`, and any other role when accessing their personal HR data. `LINE_MANAGER` sees a conditional "My Team" section here (role-aware rendering, not a separate route group).
- **`/admin/*`** — HR, payroll, compliance, settings, reports. Used by `ADMIN`, `HR_MANAGER`, `PAYROLL_OFFICER`, and `HR`. Dense desktop chrome.

**Rule for what goes where:**

> If an `EMPLOYEE` can do it, it belongs in `/my/*`. If it requires an admin-side role to act on other employees' data, it belongs in `/admin/*`. There is no `/line-manager/*` route group. LINE_MANAGER routes through `/my/*` and sees additional UI when that role is present in their claims.

`LINE_MANAGER` content does not belong in `/admin/*` under any circumstances. Their team-management surface is a conditional section inside `/my/*`.

### Deferral of role-aware middleware

Role-based route guards require backend changes to the auth token claims. Those land in Prompt B. For the initial consolidation (Prompt A), the middleware is intentionally permissive: any authenticated user may access any route under `/my/*` or `/admin/*`. Role-based redirects and guards are stubbed with TODO comments pointing to Prompt B.

### Deferral of platform-portal

The `SUPER_ADMIN` role is an internal Andikisha staff role, not a tenant role. Its portal — `platform-portal` — is a separate Next.js app that will be scaffolded in Prompt A.5. It is not part of this consolidation.

After this ADR is implemented, the `frontend/` directory looks like:

```
frontend/
  tenant-portal/    (port 3000)  customer-facing: all tenant roles
  platform-portal/  (port 3003)  internal Andikisha staff only (Prompt A.5)
  landing/          (port 3002)  marketing site (untouched)
  packages/                      shared packages (@andikisha/ui, api-client, shared-types)
```

### Font

The `tenant-portal` uses **Roboto** as its primary body font, consistent with the SmartHR template reference. Roboto is loaded via `next/font/google`. This replaces the Montserrat + DM_Mono combination used in the existing scaffolds.

### Template usage policy

The SmartHR template at `template/smarthr-nextjs/` and `template/smarthr-html/` is the visual design reference for both `tenant-portal` (admin and employee chrome) and `platform-portal` (Super Admin section). The rules of engagement are documented at `docs/design/06-template-usage.md` and enforced by the Claude Code skill at `.claude/skills/template-reference/SKILL.md`.

Three rules apply to all production code in this ADR's scope, permanently:

1. No file in `frontend/tenant-portal/` may contain an `import` that references `template/*`.
2. No template-only dependency may appear in `frontend/tenant-portal/package.json`. The forbidden list is in `.claude/skills/template-reference/04-forbidden-dependencies.md`.
3. No Bootstrap classes and no SCSS files in `frontend/tenant-portal/`. The CSS framework is Tailwind only.

---

## Alternatives Considered

### Alternative A: Keep two apps, widen role gates

Add `HR_MANAGER`, `PAYROLL_OFFICER`, `HR` to `admin-portal`'s middleware and `LINE_MANAGER` to `employee-portal`'s middleware. Each app remains separate.

**Rejected because**: `LINE_MANAGER` in `employee-portal` and admin-side roles in `admin-portal` is an arbitrary split that continues to leave multi-role users without a coherent home. Six months from now, a user who is both `EMPLOYEE` and `HR_MANAGER` still can't log in once and see all their surfaces. The two-app operational overhead (two deployments, two CI pipelines, two middleware configs) produces no architectural benefit.

### Alternative B: Collapse everything including platform-portal into one app

Put `SUPER_ADMIN` routes into the same app under `/super-admin/*`.

**Rejected because**: `SUPER_ADMIN` is an internal Andikisha staff identity, not a tenant identity. It accesses cross-tenant data, has different auth requirements (Andikisha SSO, not tenant login), and has a materially different visual surface (platform administration vs HR management). Separating it into its own app maintains a clear security and operational boundary. Mixing tenant and platform surfaces in one app is a multi-tenancy risk.

---

## Consequences

**Positive:**
- Single auth flow. One cookie (`tenant_token`), one middleware, one login page.
- Multi-role users have one app to log into. Role-aware rendering shows or hides sections without requiring app-switching.
- Single deployment unit for all tenant-facing surfaces. One CI job, one Vercel project.
- Simpler operational surface: one `pnpm dev --filter tenant-portal` for local development.
- The five stranded roles (`HR_MANAGER`, `LINE_MANAGER`, `PAYROLL_OFFICER`, `HR`, and `SUPER_ADMIN` via platform-portal) now have a clear home.

**Negative / trade-offs:**
- The merged app is larger than either predecessor. Build times will increase slightly.
- The `(my)` and `(admin)` route groups share a root layout and providers, which means a provider change affects both surfaces. Acceptable given the surfaces share auth, query client, and toast infrastructure.
- Role-based route guards are deferred to Prompt B. During the window between this PR and Prompt B, any authenticated user can reach any route. This is acceptable in a pre-production environment and the permissive middleware is clearly marked with TODO comments.

**Impact on existing files:**
- `frontend/admin-portal/` — deleted after consolidation
- `frontend/employee-portal/` — deleted after consolidation
- `frontend/superadmin-portal/` — deleted (leftover scaffold, no production intent)
- `pnpm-workspace.yaml` — updated; `!template/**` exclusion retained
- Root `package.json` scripts — updated to `dev:tenant`, `build:tenant`
- `CLAUDE.md` — frontend conventions section updated
- GitHub Actions CD workflows — must be manually updated at merge time (no `vercel.json` exists; deployment is UI-configured)
