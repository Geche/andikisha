# Platform Portal Scaffold Audit (Prompt A.5)

*Generated: 2026-05-14. Read-only audit — no files were modified.*

---

## 1. Prerequisites (Audit 0.1)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `frontend/tenant-portal/` | **EXISTS** | Full Next.js 15 app, functional |
| 2 | `frontend/packages/ui/` | **EXISTS** | Full shared library |
| 3 | `HorizontalShell` in `@andikisha/ui` | **EXISTS** | See full prop interface below |
| 4 | `useCurrentUser` — accepts `initialUser` prop | **EXISTS** | `CurrentUserProvider` accepts `initialUser?: CurrentUser \| null` |
| 5 | `PermissionGate` | **EXISTS** | Gates by `allow` (ALL roles) or `anyOf` (ANY role) |
| 6 | `findCorrectDashboard` in `packages/ui/src/lib/auth.ts` | **EXISTS** | Handles SUPER_ADMIN → platform portal URL, admin roles → /admin/dashboard, EMPLOYEE → /my/dashboard |
| 7 | Brand tokens — Tailwind preset | **EXISTS** | `frontend/packages/ui/tailwind-preset.ts` — defines brand-50 through brand-950, amber, surface, neutral-50 through neutral-900, near-black, whatsapp, error |
| 8 | `formatMoney`, `formatDate`, `formatTime` | **EXISTS** | `packages/ui/src/lib/formatMoney.ts` and `packages/ui/src/lib/formatDate.ts`; all three exported from barrel |
| 9 | `template/smarthr-html/layout-horizontal.html` | **EXISTS** | 281 KB Bootstrap-based horizontal layout reference |
| 10 | `platform-portal` middleware | **EXISTS** | Cookie name: `platform_token`. Guards SUPER_ADMIN only; redirects non-SUPER_ADMIN to `NEXT_PUBLIC_TENANT_PORTAL_URL`. Identical JWT decoding pattern as tenant-portal middleware |
| 11 | `NavItem` type — exported from `@andikisha/ui` | **EXISTS** | `NavItem` and `NavSection` exported from `SidebarShell.tsx` and re-exported from barrel. `HorizontalNavItem` is a separate type from `HorizontalShell.tsx`, also exported. See shapes below |
| 12 | `EmptyState` | **EXISTS** | Props: `icon: ElementType`, `title: string`, `description?: string`, `action?: ReactNode`, `className?: string` |
| 13 | `QueryProvider` | **EXISTS** | Wraps `@tanstack/react-query`'s `QueryClientProvider` |
| 14 | `ToastProvider` | **EXISTS** | Exported as `ToastProvider` and `useToast` from barrel |

**No blocking prerequisites.** All critical dependencies exist.

---

## 2. HorizontalShell Props Interface

```typescript
// from frontend/packages/ui/src/components/HorizontalShell.tsx

export interface HorizontalNavItem {
  label: string;
  href?: string;
  icon?: ElementType;           // Lucide icon component
  badge?: string | number;      // red pill badge on item
  children?: HorizontalNavItem[]; // sub-items rendered in dropdown on click
}

interface HorizontalShellProps {
  navItems: HorizontalNavItem[];
  /** Right-side slot: profile menu, notifications, settings buttons */
  rightSlot?: ReactNode;
  /** Amber impersonation banner above the nav bar */
  impersonationBanner?: ReactNode;
  children: ReactNode;
  className?: string;
}
```

**Known gap:** The `active` prop is passed `false` unconditionally on line 260. The component itself supports the `active` boolean per `TopNavItem`, but the shell never reads `usePathname()` to compute which item is active. The platform-portal's layout component will need to either (a) pass a `currentPath` prop to the shell and let it compute active states, or (b) the shell needs `usePathname` added internally. This is the most significant functional gap.

---

## 3. NavItem Type Shape

Two separate nav item types exist and are exported from `@andikisha/ui`:

**`HorizontalNavItem`** — used by `HorizontalShell` (correct type for platform-portal):
```typescript
{
  label: string;
  href?: string;
  icon?: ElementType;
  badge?: string | number;
  children?: HorizontalNavItem[];
}
```

**`NavItem`** — used by `SidebarShell` (sidebar/vertical navigation):
```typescript
{
  label: string;
  href?: string;
  icon: ElementType;          // required (not optional)
  badge?: string | number;
  locked?: boolean;
}
```

**For `platform-portal/src/lib/navConfig.ts`**, use `HorizontalNavItem[]`. The menu doc's `NavItem` typedef (in `../product/menu-source-of-truth.md`) includes `visibleForRoles`, `visibleForTiers`, `visibleWhenFlag`, and `renderOnlyIfRolePresent` — **none of these are on `HorizontalNavItem`**. Platform-portal all items are `SUPER_ADMIN`-only, so visibility filtering is not needed in the config at this stage. Sub-items use `children: HorizontalNavItem[]`.

---

## 4. tenant-portal Patterns to Mirror

From reading `frontend/tenant-portal/src/app/layout.tsx` and `src/middleware.ts`:

**Root layout structure (providers order):**
```
<html> → <body> → <QueryProvider> → <CurrentUserProvider initialUser={...}> → <ToastProvider> → {children}
```
Order is mandatory: `CurrentUserProvider` uses `useQuery` internally, so `QueryProvider` must be the outermost wrapper.

**Font loading:**
- `Roboto` via `next/font/google` with weights 300/400/500/700
- Assigned to CSS variable `--font-roboto`
- Applied as `font-body` Tailwind class on `<body>`

**`initialUser` construction from x-user-* headers:**
```typescript
const hdrs = await headers();
const userId = hdrs.get("x-user-id");
const role = hdrs.get("x-user-role") ?? "";
const roles = hdrs.get("x-user-roles")?.split(",").filter(Boolean) ?? (role ? [role] : []);
const initialUser: CurrentUser | null = userId
  ? { userId, tenantId: hdrs.get("x-tenant-id") ?? "", email: hdrs.get("x-user-email") ?? "",
      roles: roles as UserRole[], employeeId: hdrs.get("x-employee-id") ?? undefined }
  : null;
```
Note: tenant-portal reads `x-tenant-id`. Platform-portal middleware does **not** set `x-tenant-id` (SUPER_ADMIN has no tenant). The `CurrentUser` type has `tenantId: string` (non-optional), so platform-portal's `initialUser` construction must pass an empty string for `tenantId`.

**Cookie name:** `tenant_token` (platform-portal uses `platform_token`)

**PWA setup:** `layout.tsx` includes `manifest: "/manifest.json"` in metadata. The root `layout.tsx` does not register a service worker directly — the service worker registration lives in `(my)/layout.tsx` (the employee route group), not in the root layout. Platform-portal's root layout should **not** include a manifest reference pointing to a PWA manifest; it can omit it entirely or use a non-PWA manifest.

**Environment variables used:** `JWT_SECRET` (middleware), `NEXT_PUBLIC_PLATFORM_PORTAL_URL` (middleware redirect for SUPER_ADMIN).

**Route group conventions:** `(my)/my/*` for employee self-service, `(admin)/admin/*` for HR management. Platform-portal has no equivalent route groups yet — pages are at the root level (e.g. `/dashboard`, `/tenants`).

---

## 5. Template Horizontal Layout Spec

From `template/smarthr-html/layout-horizontal.html`:

**Overall HTML structure:**
- `<body class="menu-horizontal">` wraps a `.main-wrapper`
- Inside: `.header > .main-header` (the nav bar) + `.page-wrapper > .content` (content area)
- The header is **not** `position: fixed` in the template markup itself (Bootstrap handles sticky via CSS)

**Logo position:**
- Far left inside `.header-left` — a separate `<div>` before the nav items
- In the template: logo image only, no text alongside it

**Menu items arrangement:**
- The horizontal nav sits inside `#horizontal-menu` or `#horizontal-single` as a `sidebar-horizontal` div
- Items are `<li class="submenu">` elements in a `.nav-menu` `<ul>`
- Items render **left-to-right**, left-aligned, starting after the logo
- Each top-level item shows: icon + label + chevron (if has children)
- Active state: `class="active"` on the `<a>` element and `class="active subdrop"` on parent `<li>` when a sub-item is active

**User menu/avatar position:** Far right in `.header-user > .nav.user-menu` — avatar with dropdown, bell notification, mail, apps grid, and settings icons all on the right side

**Dropdown sub-menus:** Click-triggered Bootstrap dropdowns. Child `<ul>` renders below parent `<li>`. Nested sub-menus use `class="submenu submenu-two"` with an inside arrow.

**Active state:** CSS class `active` on `<a>` tags. No `data-` attribute approach.

**Approximate spacing:**
- Nav bar height: not explicitly set in markup, controlled by CSS (visually ~60px)
- Logo area: padded left
- Nav item padding: Bootstrap button padding (~8px 12px)
- Separation between logo and nav: no explicit separator, just spacing

**Content area placement:** Below the `.header`, inside `.page-wrapper > .content` with Bootstrap padding classes

**Mapping to HorizontalShell:**

| Template pattern | HorizontalShell implementation |
|---|---|
| Logo far left | `LogoFull` in left div, `pr-6 border-r border-neutral-200 mr-4` — adds right separator |
| Nav items left-aligned | `flex-1 gap-0.5` nav, items start after logo |
| Item height | `h-[56px]` per item (template ~60px) |
| Active underline | `border-b-2 border-b-brand-900` on active item (template uses `active` class background) |
| Right user area | `rightSlot` prop, `flex items-center gap-2` |
| Dropdown on click | Toggle `useState` open/close — matches template's click-trigger pattern |
| Mobile hamburger | `Menu` icon button, slide-in drawer |
| Sub-items in dropdown | `DropdownNavItem` components in absolute-positioned panel |

---

## 6. HorizontalShell Gap Analysis

**What matches the template:**
- Logo left + nav items left + right user slot: correct
- Click-to-open dropdown pattern: correct
- Dropdown renders below parent with shadow: correct
- Mobile drawer fallback: present and functional

**Gaps that need fixing before A.5:**

1. **Active state is hardcoded to `false`** (line 260: `active={false}`). The shell never determines which item is currently active. Every nav item renders as inactive regardless of the current URL. Fix: add `usePathname()` inside the shell and compute `active` based on `pathname.startsWith(item.href ?? "")`. This is a functional correctness issue for platform-portal.

2. **No `usePathname` import** — the shell is a `"use client"` component but does not import `usePathname` from `next/navigation`. Adding it is a two-line change.

3. **`HorizontalNavItem.icon` is optional** (`icon?: ElementType`) but `SidebarShell.NavItem.icon` is required. The platform-portal nav config should always provide icons — this is not a bug but a documentation note for the navConfig author.

4. **`HorizontalNavItem` has no visibility fields** (`visibleForRoles`, `visibleForTiers`, etc.). For platform-portal this is acceptable because all items are SUPER_ADMIN-only and filtering happens at the middleware level. If the nav config spec in `../product/menu-source-of-truth.md` is to be strictly followed, the type needs extending — but that is Prompt B2 scope, not A.5 scope.

5. **No `NavItem` export from `HorizontalShell`** using the canonical name from `../product/menu-source-of-truth.md`. The doc calls it `NavItem`; the actual exported type is `HorizontalNavItem`. This naming divergence should be noted in the navConfig file comment.

6. **Template uses background-color for active state**; HorizontalShell uses border-bottom underline. This is an intentional design decision (underline is cleaner for horizontal nav) — not a gap, just worth documenting.

---

## 7. Workspace & Deployment

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "frontend/*"
  - "frontend/packages/*"
  - '!template/**'
```
`frontend/*` glob already covers `frontend/platform-portal`. No change needed. Platform-portal is already a pnpm workspace member.

**`vercel.json`:** Exists only at `frontend/landing/vercel.json` — the landing site has its own Vercel config. No root-level `vercel.json` exists. Platform-portal will need its own `frontend/platform-portal/vercel.json` if deploying to Vercel separately. Not blocking for local development.

**`frontend/platform-portal/.env.local.example`:** EXISTS. Contains:
```
API_GATEWAY_URL=http://localhost:8080
JWT_SECRET=<base64-encoded-secret>
NEXT_PUBLIC_TENANT_PORTAL_URL=http://localhost:3000
```
Missing: `NEXT_PUBLIC_PLATFORM_PORTAL_URL` is not in this file (it is the platform portal URL itself, needed by tenant-portal to redirect to platform-portal, not by platform-portal itself). This is correct.

**`NEXT_PUBLIC_TENANT_PORTAL_URL`:** Referenced in `frontend/platform-portal/src/middleware.ts` line 55. Set correctly in `.env.local.example`.

**`NEXT_PUBLIC_PLATFORM_PORTAL_URL`:** Referenced in `frontend/tenant-portal/src/middleware.ts` line 61 and `frontend/tenant-portal/.env.local.example` (`NEXT_PUBLIC_PLATFORM_PORTAL_URL=http://localhost:3003`). This is in the correct place — tenant-portal sends SUPER_ADMIN users to platform-portal.

**`frontend/platform-portal/tsconfig.json`:** Exists. Contains workspace paths for `@andikisha/ui` and `@andikisha/ui/auth`. Missing path aliases for `@andikisha/api-client` and `@andikisha/shared-types` (which tenant-portal has). Not immediately blocking for A.5, but should be added if platform-portal's API calls go through `@andikisha/api-client`.

**`frontend/platform-portal/next.config.ts`:** Exists. `transpilePackages: ["@andikisha/ui"]`. Complete.

---

## 8. Navigation Config for platform-portal

All items `visibleForRoles: ["SUPER_ADMIN"]` (all items, all roles). No tier gating, no feature flags in MVP. Sub-items use `children` array.

| Label | Route | Lucide Icon | Sub-items |
|---|---|---|---|
| Dashboard | `/dashboard` | `LayoutDashboard` | None |
| Tenants | `/tenants` | `Building2` | Provision new, Tenant detail, Feature flags, Suspension, Schema mgmt, Migration tools, Usage metrics |
| Billing & Revenue | `/billing` | `CreditCard` | Invoices, Plans & pricing, Payment methods, Usage metering, Revenue reports, Churn, Dunning |
| Compliance Library | `/compliance` | `BookOpen` | PAYE brackets, NSSF rates, SHIF rates, Housing Levy, Country packs, Rate scheduler, Regulatory changelog |
| Integration Hub | `/integrations` | `Plug` | KRA iTax, NSSF, SHIF, Daraja (M-Pesa), Africa's Talking, Bank APIs, Webhook log |
| Support | `/support` | `LifeBuoy` | Tenant tickets, Support agents, SLA policies, Escalation rules, Knowledge base |
| Platform Users | `/users` | `Users` | SUPER_ADMIN accounts, Access logs, 2FA enforcement, IP allowlisting |
| Audit & Security | `/audit` | `Shield` | Cross-tenant audit log, Security events, KDPA requests, Key rotation, Certifications |
| System Health | `/system` | `Activity` | Service status (13 services), DB health, RabbitMQ, Redis, Zipkin, Batch inspector, API Gateway metrics |
| Communications | `/communications` | `Megaphone` | Tenant announcements, Maintenance notices, Compliance alerts, Email/SMS templates |
| Settings | `/settings` | `Settings` | Platform config, Default tenant template, Rate limits, SSO for staff, Feature flag rollouts, Env config |

**`platformNavConfig` structure** (`frontend/platform-portal/src/lib/navConfig.ts`):
```typescript
import type { HorizontalNavItem } from "@andikisha/ui";
import {
  LayoutDashboard, Building2, CreditCard, BookOpen, Plug,
  LifeBuoy, Users, Shield, Activity, Megaphone, Settings
} from "lucide-react";

export const platformNavConfig: HorizontalNavItem[] = [
  { label: "Dashboard",          href: "/dashboard",     icon: LayoutDashboard },
  { label: "Tenants",            href: "/tenants",       icon: Building2,  children: [...] },
  { label: "Billing & Revenue",  href: "/billing",       icon: CreditCard, children: [...] },
  { label: "Compliance Library", href: "/compliance",    icon: BookOpen,   children: [...] },
  { label: "Integration Hub",    href: "/integrations",  icon: Plug,       children: [...] },
  { label: "Support",            href: "/support",       icon: LifeBuoy,   children: [...] },
  { label: "Platform Users",     href: "/users",         icon: Users },
  { label: "Audit & Security",   href: "/audit",         icon: Shield,     children: [...] },
  { label: "System Health",      href: "/system",        icon: Activity,   children: [...] },
  { label: "Communications",     href: "/communications",icon: Megaphone,  children: [...] },
  { label: "Settings",           href: "/settings",      icon: Settings,   children: [...] },
];
```

---

## 9. BFF /api/auth/me Delta

**tenant-portal version** (`src/app/api/auth/me/route.ts`):
- Cookie: `tenant_token`
- Calls: `GET ${API_GATEWAY_URL}/api/v1/auth/me` with `Authorization: Bearer <token>`
- Maps upstream `{ id, tenantId, email, role, roles?, employeeId? }` to `CurrentUser`
- Returns `{ userId, tenantId, email, fullName: undefined, roles, employeeId }`
- Error handling: 401 → `UNAUTHENTICATED`, network error → `GATEWAY_UNREACHABLE` (502), upstream non-ok → `UPSTREAM_ERROR` (502), shape validation → `INVALID_UPSTREAM_RESPONSE` (502)

**platform-portal version — what changes:**

| Field | tenant-portal | platform-portal |
|---|---|---|
| Cookie name | `tenant_token` | `platform_token` |
| Upstream response `tenantId` | Present | Absent (SUPER_ADMIN has no tenant) |
| Upstream response `employeeId` | Present | Absent |
| `CurrentUser.tenantId` | Real UUID | Empty string `""` |
| `CurrentUser.roles` | Any role set | Should always be `["SUPER_ADMIN"]`; add guard: return 401 if role is not SUPER_ADMIN |
| Endpoint path | `/api/v1/auth/me` | Same path — auth-service handles platform tokens too |

**Additional guard for platform-portal:** After mapping the upstream response, reject (401) if the resolved roles do not include `SUPER_ADMIN`. This is defence-in-depth: the middleware already blocks non-SUPER_ADMIN at the route level, but the BFF should not serve a non-SUPER_ADMIN user object to a platform-portal client component.

---

## 10. What Prompt B Already Built

From reading `frontend/platform-portal/`:

| File | Status | Content |
|---|---|---|
| `package.json` | EXISTS | `next@15.1.0`, `@andikisha/ui: workspace:*`, `jose@^5.10.0`, `react@^19`, Tailwind v4, TypeScript, full scripts |
| `tsconfig.json` | EXISTS | Strict mode, Next.js plugin, workspace paths for `@andikisha/ui` and `@andikisha/ui/auth` |
| `next.config.ts` | EXISTS | `transpilePackages: ["@andikisha/ui"]` |
| `src/middleware.ts` | EXISTS | Full JWT verification, `platform_token` cookie, SUPER_ADMIN guard, header forwarding |
| `src/app/layout.tsx` | EXISTS | **Bare-bones** — generic Next.js scaffold (`metadata: { title: 'Next.js' }`), no Roboto font, no providers, no header reading |
| `src/app/page.tsx` | EXISTS | Redirects to `/login` |
| `src/app/login/page.tsx` | EXISTS | Placeholder only — `<p>Platform portal login — wired in Prompt A.5.</p>` |
| `.env.local.example` | EXISTS | Three vars: `API_GATEWAY_URL`, `JWT_SECRET`, `NEXT_PUBLIC_TENANT_PORTAL_URL` |
| `node_modules/` | EXISTS | Dependencies installed |
| `postcss.config.*` | **MISSING** | No PostCSS config — Tailwind v4 will not work without it |
| `src/app/globals.css` | **MISSING** | No CSS file — `@import "tailwindcss"` and `@theme` block needed |
| `src/lib/navConfig.ts` | **MISSING** | Platform nav config not created |
| `src/app/api/auth/me/route.ts` | **MISSING** | BFF route not created |
| Dashboard route | **MISSING** | `src/app/(platform)/dashboard/page.tsx` not created |
| Any feature routes | **MISSING** | `/tenants`, `/billing`, `/compliance`, etc. — all stubs missing |

---

## 11. What A.5 Still Needs to Build

Listed in dependency order:

1. **`src/app/globals.css`** — `@import "tailwindcss"`, `@source` pointing to packages/ui, `@theme` block with all brand tokens (copy from tenant-portal's globals.css verbatim, remove PWA manifest reference)

2. **`postcss.config.mjs`** — `{ plugins: { "@tailwindcss/postcss": {} } }` (copy from tenant-portal)

3. **`src/app/layout.tsx` (replace)** — Add Roboto font, read x-user-* headers, construct `initialUser`, wrap in `QueryProvider > CurrentUserProvider > ToastProvider`. Remove PWA manifest from metadata. Correct `metadata.title` to `"Platform | AndikishaHR"`.

4. **`src/lib/navConfig.ts`** — Export `platformNavConfig: HorizontalNavItem[]` with all 11 top-level items and their children as documented in Section 8.

5. **`HorizontalShell` active state fix (in `@andikisha/ui`)** — Add `usePathname()` and compute `active` per item. This is a shared library fix, required before the shell is usable in platform-portal. One-line fix per item: `active={pathname === item.href || pathname.startsWith((item.href ?? "") + "/")}`.

6. **`src/app/api/auth/me/route.ts`** — BFF route using `platform_token` cookie, SUPER_ADMIN guard, `tenantId: ""` fallback (see Section 9).

7. **`src/app/login/page.tsx` (replace)** — Real login form. Should mirror tenant-portal's login page structure but use `platform_token` cookie. The form posts to `/api/auth/login` (BFF) or directly to the gateway. The login page should display the `WRONG_PORTAL` error if the user arrives from a tenant-portal rejection.

8. **`src/app/api/auth/login/route.ts`** — BFF POST that calls `${API_GATEWAY_URL}/api/v1/auth/login`, validates SUPER_ADMIN in response, sets `platform_token` HTTP-only cookie, redirects to `/dashboard`.

9. **`src/app/(platform)/layout.tsx`** — Route group layout that wraps pages with `HorizontalShell`, passes `platformNavConfig` as `navItems`, passes `ProfileMenu` as `rightSlot`. No service worker registration.

10. **`src/app/(platform)/dashboard/page.tsx`** — Platform dashboard stub with `PageHeader` and `EmptyState` or real KPI cards. Title: "Platform Dashboard".

11. **Remaining stub pages** (can be minimal `EmptyState` pages): `/tenants`, `/billing`, `/compliance`, `/integrations`, `/support`, `/users`, `/audit`, `/system`, `/communications`, `/settings`. Each needs `src/app/(platform)/{route}/page.tsx`.

12. **`src/app/page.tsx` (update)** — Change redirect from `/login` to `/dashboard` (middleware will intercept unauthenticated requests and send to `/login` automatically). This avoids the double redirect for authenticated users.

13. **`tsconfig.json` (update)** — Add path aliases for `@andikisha/api-client` and `@andikisha/shared-types` to match tenant-portal's tsconfig. Not blocking for stub pages but needed when API calls are added.

---

## 12. Unresolved Questions

Before scaffolding begins, Lawrence should confirm:

1. **Login flow: BFF or direct gateway?** Does platform-portal have its own `/api/auth/login` BFF route (same pattern as tenant-portal), or does the login page POST directly to the gateway and receive the cookie from the gateway response? Tenant-portal's pattern is BFF-mediated (the Next.js route sets the HTTP-only cookie). Recommend: same BFF pattern for security consistency.

2. **`CurrentUser.tenantId` for SUPER_ADMIN:** The `CurrentUser` type has `tenantId: string` (non-optional). SUPER_ADMIN has no tenant. Should `tenantId` be `string | undefined` (requires a type change in `@andikisha/ui`), or should platform-portal's BFF pass `""` as a sentinel value? The empty string approach avoids a breaking type change and is acceptable if all platform-portal code treats `""` as "no tenant".

3. **`HorizontalShell` active state — fix in library or in portal?** The fix (adding `usePathname`) should go in the library so it works for any future consumer. But this modifies `@andikisha/ui`. Confirm this is in scope for A.5 or whether A.5 should work around it by computing `active` in the nav config and passing it down differently.

4. **Platform-portal login page design:** Should the login page be visually identical to tenant-portal's login (same form, same layout), or is a simplified internal staff login acceptable? Tenant-portal's login has full branding and the WRONG_PORTAL error handling. Platform-portal could reuse the same design with just the cookie name and redirect target changed.

5. **`@andikisha/api-client` in platform-portal:** Does A.5 scope include wiring API calls in stub pages, or are stubs all static? If stubs are static `EmptyState` placeholders, `@andikisha/api-client` is not needed yet. If the dashboard needs real service health data, it needs the client and the missing tsconfig paths.

6. **Vercel deployment config:** Is platform-portal deploying to Vercel in the same project as tenant-portal (as separate deployment), or separately? This affects whether a `frontend/platform-portal/vercel.json` is needed now or later.

---

## 13. Scaffolding Plan

**Prerequisite fix (do first, in `@andikisha/ui`):**

**Step 0:** Fix `HorizontalShell` active state — add `usePathname()` and compute `active` per `TopNavItem`. Two imports added, one prop computed per map iteration. No API change.

**Platform-portal scaffold (in order):**

**Step 1:** CSS and build config
- Create `src/app/globals.css` (copy from tenant-portal, remove PWA manifest)
- Create `postcss.config.mjs`

**Step 2:** Root layout upgrade
- Replace `src/app/layout.tsx` with full provider-wrapped layout (Roboto font, header reading, `initialUser` construction, provider order, correct metadata)

**Step 3:** Auth infrastructure
- Create `src/app/api/auth/login/route.ts` (BFF POST — calls gateway, validates SUPER_ADMIN, sets `platform_token` cookie)
- Create `src/app/api/auth/me/route.ts` (BFF GET — uses `platform_token`, SUPER_ADMIN guard, `tenantId: ""`)

**Step 4:** Login page
- Replace `src/app/login/page.tsx` with real login form (mirrors tenant-portal structure, uses `platform_token`, `WRONG_PORTAL` error handling)

**Step 5:** Nav config
- Create `src/lib/navConfig.ts` with `platformNavConfig` (all 11 items with icons and children)

**Step 6:** Route group layout
- Create `src/app/(platform)/layout.tsx` wrapping `HorizontalShell` with `platformNavConfig` and `ProfileMenu` in `rightSlot`

**Step 7:** Dashboard page
- Create `src/app/(platform)/dashboard/page.tsx` with `PageHeader` and placeholder KPI structure

**Step 8:** Stub pages (can be done in parallel for each top-level section)
- `/tenants`, `/billing`, `/compliance`, `/integrations`, `/support`, `/users`, `/audit`, `/system`, `/communications`, `/settings` — each as a `PageHeader` + `EmptyState`

**Step 9:** Root redirect fix
- Update `src/app/page.tsx` to redirect to `/dashboard` instead of `/login`

**Step 10:** tsconfig path aliases
- Update `tsconfig.json` to add `@andikisha/api-client` and `@andikisha/shared-types` paths

**Step 11:** Type-check
- Run `pnpm --filter platform-portal type-check` to verify no TypeScript errors

---

## Status

**READY TO PROCEED** — with one qualification.

There are no blocking missing prerequisites. All shared library components exist, the middleware is functional, the workspace is correctly configured, and the nav inventory is fully documented.

The one issue to address **before or as the first task of A.5**: the `HorizontalShell` active state bug (line 260 of `HorizontalShell.tsx` passes `active={false}` for every nav item unconditionally). This must be fixed in `@andikisha/ui` for the platform-portal nav to show which page the user is on. It is a three-line change and does not break any existing consumer.

The unresolved questions in Section 12 are design decisions, not blockers. The scaffolding can begin with reasonable defaults (BFF pattern for login, `tenantId: ""` for SUPER_ADMIN, active state fix in the library) and revisit if Lawrence has different preferences.
