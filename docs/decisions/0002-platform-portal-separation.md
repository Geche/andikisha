# ADR 0002: Platform Portal Separation

**Date:** 2026-05-14
**Status:** Accepted
**Deciders:** Lawrence Chege

---

## Context

SUPER_ADMIN users are AndikishaHR internal staff with cross-tenant administrative authority. They have no employee record in any tenant, no tenant context, and their actions affect every customer on the platform. A compromise of the SUPER_ADMIN role has the maximum possible blast radius.

Before Prompt A.5, SUPER_ADMIN access was either served from the same Next.js app as tenant users (higher blast radius, shared cookie jar) or not built at all. The existing `tenant-portal` app serves the three primary tenant roles (ADMIN, HR_MANAGER/PAYROLL_OFFICER/HR, EMPLOYEE/LINE_MANAGER). Adding SUPER_ADMIN to the same app would mean a single XSS or session-fixation bug affecting a tenant user could potentially be leveraged against SUPER_ADMIN credentials.

---

## Decision

Scaffold `platform-portal` as a **separate Next.js 15 App Router application** at `frontend/platform-portal/` (port 3003, subdomain `platform.andikishahr.com` in production).

**Architectural choices:**

- **Separate app, shared library.** `platform-portal` consumes `@andikisha/ui` for all primitives and chrome, identical to `tenant-portal`. Visual identity and component behaviour are consistent across both portals.
- **Horizontal navigation layout.** `HorizontalShell` from `@andikisha/ui` provides the chrome. SUPER_ADMIN has fewer top-level destinations (~11) and works exclusively on desktop. A horizontal bar maximises the full-width content area for data-dense tables (tenant lists, billing tables, service health dashboards). Reference: `template/smarthr-html/layout-horizontal.html`.
- **Distinct cookie name.** `platform_token` (not `tenant_token`) prevents browser cookie collision when both portals are open on the same machine during development, and isolates session state in production.
- **SUPER_ADMIN only, strict from day one.** The middleware is not permissive. Any request without a verified SUPER_ADMIN claim is rejected at the Edge before any server component renders. This is distinct from `tenant-portal`'s middleware, which was intentionally permissive in earlier scaffolding phases.
- **No PWA.** SUPER_ADMIN users are desktop-only. No service worker, no manifest, no offline caching.
- **No tenant-scoped API calls.** `platform-portal` does not pass `X-Tenant-ID` headers to the backend. Any component needing cross-tenant data reads through platform-level endpoints only.

**Cross-portal redirects (from Prompt B):**
- SUPER_ADMIN landing on `tenant-portal` → redirected to `NEXT_PUBLIC_PLATFORM_PORTAL_URL`.
- Non-SUPER_ADMIN landing on `platform-portal` → redirected to `NEXT_PUBLIC_TENANT_PORTAL_URL`.
- SUPER_ADMIN attempting to log into `tenant-portal` login page → `WRONG_PORTAL` 403 with link to platform portal.
- Non-SUPER_ADMIN attempting to log into `platform-portal` login page → `WRONG_PORTAL` 403 with link to tenant portal.

**Type system:** `CurrentUser.tenantId` is `string | undefined` (not `string`). SUPER_ADMIN genuinely has no tenant; the type reflects that. The empty-string sentinel was rejected because it pushes the constraint to runtime — every consumer must remember that `""` means "no tenant". The optional field forces TypeScript to surface every callsite that assumes tenantId is present.

---

## Alternatives Considered

**A: Keep SUPER_ADMIN in `tenant-portal` at `/super-admin/*`**
- Simpler operationally — one app to deploy.
- Rejected: shares the same JavaScript bundle, cookie jar, and CSP surface as tenant users. A bug in tenant-facing code becomes a potential attack vector against SUPER_ADMIN. The blast radius argument applies to the app boundary, not just the route boundary.

**B: Deploy `platform-portal` behind VPN only**
- Maximum isolation — the app is not reachable from the public internet.
- Acceptable for production hardening; left as a deployment decision for Lawrence. The app itself is ready for VPN-gating without code changes.
- Not implemented in A.5 (out of scope for the scaffold prompt).

**C: Server-side rendering only, no client components**
- Would eliminate XSS risk in the SUPER_ADMIN surface entirely.
- Rejected: too restrictive for data-dense admin tooling (sortable tables, live health dashboards, charts). RSC and "use client" boundaries are used as in tenant-portal.

---

## Consequences

**Positive:**
- Security boundary matches the trust boundary. A `tenant-portal` compromise cannot directly access SUPER_ADMIN credentials.
- Separate deployment pipeline for `platform-portal` — can deploy platform-portal updates without touching tenant-portal.
- Operational: different rate limits, logging, and monitoring can be applied to the SUPER_ADMIN surface independently.

**Negative / costs:**
- Three frontend apps in `frontend/` (`tenant-portal`, `platform-portal`, `landing`) — more CI/CD surface.
- Shared library (`@andikisha/ui`) changes must be tested against both portals, not just one.
- Cross-portal redirect logic (cookie name mapping, env vars) is a new operational surface to keep in sync.

**Follow-up work:**
- Vercel deployment configuration for `platform-portal` (separate project or monorepo setup — manual, by Lawrence).
- VPN-gating or IP allowlisting for the SUPER_ADMIN surface (deployment decision, not code).
- Prompt B1: multi-role JWT claims (`roles[]` array), which both portals already handle via the B0/B1 bridge pattern.
- Prompt A.6 gaps: any `@andikisha/ui` component gaps discovered during `platform-portal` feature build-out.

---

## Frontend Directory After A.5

```
frontend/
  tenant-portal/    port 3000   customer-facing: HR, payroll, employee self-service
  platform-portal/  port 3003   internal Andikisha staff (SUPER_ADMIN only)
  landing/          port 3002   marketing site (untouched by A.5)
```
