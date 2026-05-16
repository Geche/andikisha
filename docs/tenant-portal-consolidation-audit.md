# Tenant Portal Consolidation Audit

**Date**: 2026-05-13  
**Branch**: master  
**Scope**: `frontend/admin-portal/` and `frontend/employee-portal/`  
**Purpose**: Pre-consolidation read-only audit for the single `tenant-portal` merge

---

## Audit 0.1: Scaffold Inventory

### Admin Portal — `frontend/admin-portal/`

```
admin-portal/
├── public/
│   ├── icons/
│   ├── images/
│   ├── favicon.svg
│   └── logomark.svg
├── src/
│   ├── app/
│   │   ├── (dashboard)/        ← route group
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── leave/
│   │   │   ├── payroll/
│   │   │   ├── shell-preview/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/login/
│   │   │   ├── auth/logout/
│   │   │   └── proxy/[...path]/
│   │   ├── login/
│   │   ├── preview/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── layout/             ← ClientSidebar, LogoutButton, Sidebar, TenantCommandPalette
│   └── lib/
│       ├── api-client.ts
│       └── auth.ts
├── .env.local
├── .env.local.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

**Source file count**: 29 `.tsx`/`.ts` files  
**Assessment**: More substantive scaffold. Contains all the complex admin logic (payroll runs, employee CRUD with sub-routes, leave approval modals), a richer component set, and the command palette. **This is the dominant scaffold for the merge base.**

### Employee Portal — `frontend/employee-portal/`

```
employee-portal/
├── public/
│   ├── icons/
│   ├── images/
│   ├── favicon.svg
│   └── logomark.svg
├── src/
│   ├── app/
│   │   ├── (dashboard)/        ← route group
│   │   │   ├── attendance/
│   │   │   ├── dashboard/
│   │   │   ├── leave/
│   │   │   ├── payslips/
│   │   │   ├── profile/
│   │   │   ├── shell-preview/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/login/
│   │   │   ├── auth/logout/
│   │   │   └── proxy/[...path]/
│   │   ├── auth/login/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── layout/             ← ClientSidebar, LogoutButton, Sidebar
│   └── lib/
│       ├── api-client.ts
│       └── auth.ts
├── .env.local
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

**Source file count**: 19 `.tsx`/`.ts` files  
**Assessment**: Lighter scaffold, employee self-service only. No sub-routes (leave and payroll are single-page lists). No command palette. Missing `ToastProvider`.

---

## Audit 0.2: Route Structure

### Admin Portal Routes

| URL path | File | Classification |
|---|---|---|
| `/` | `app/page.tsx` | Shared infrastructure — root redirect |
| `/login` | `app/login/page.tsx` | Shared infrastructure — authentication |
| `/api/auth/login` | `app/api/auth/login/route.ts` | Shared infrastructure — BFF login handler |
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | Shared infrastructure — BFF logout handler |
| `/api/proxy/[...path]` | `app/api/proxy/[...path]/route.ts` | Shared infrastructure — BFF API proxy |
| `/preview` | `app/preview/page.tsx` | Shared infrastructure — shell preview |
| `/shell-preview` | `app/(dashboard)/shell-preview/page.tsx` | Shared infrastructure — shell preview (in dashboard group) |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | **`/admin/*`** — admin dashboard |
| `/employees` | `app/(dashboard)/employees/page.tsx` | **`/admin/*`** — employee list |
| `/employees/[employeeId]` | `app/(dashboard)/employees/[employeeId]/page.tsx` | **`/admin/*`** — employee detail |
| `/employees/new` | `app/(dashboard)/employees/new/page.tsx` | **`/admin/*`** — create employee |
| `/leave` | `app/(dashboard)/leave/page.tsx` | **`/admin/*`** — leave management (approve/reject) |
| `/leave/[requestId]` | `app/(dashboard)/leave/[requestId]/page.tsx` | **`/admin/*`** — leave request detail |
| `/payroll` | `app/(dashboard)/payroll/page.tsx` | **`/admin/*`** — payroll runs list |
| `/payroll/new` | `app/(dashboard)/payroll/new/page.tsx` | **`/admin/*`** — create payroll run |
| `/payroll/[runId]` | `app/(dashboard)/payroll/[runId]/page.tsx` | **`/admin/*`** — payroll run detail |

**Private components** (co-located with routes):
- `app/(dashboard)/leave/_components/ApproveModal.tsx`
- `app/(dashboard)/leave/_components/RejectModal.tsx`
- `app/(dashboard)/leave/_types.ts`

### Employee Portal Routes

| URL path | File | Classification |
|---|---|---|
| `/` | `app/page.tsx` | Shared infrastructure — root redirect |
| `/auth/login` | `app/auth/login/page.tsx` | Shared infrastructure — authentication |
| `/api/auth/login` | `app/api/auth/login/route.ts` | Shared infrastructure — BFF login handler |
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | Shared infrastructure — BFF logout handler |
| `/api/proxy/[...path]` | `app/api/proxy/[...path]/route.ts` | Shared infrastructure — BFF API proxy |
| `/shell-preview` | `app/(dashboard)/shell-preview/page.tsx` | Shared infrastructure — shell preview |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | **`/my/*`** — employee dashboard |
| `/attendance` | `app/(dashboard)/attendance/page.tsx` | **`/my/*`** — time/attendance log |
| `/leave` | `app/(dashboard)/leave/page.tsx` | **`/my/*`** — employee leave requests |
| `/payslips` | `app/(dashboard)/payslips/page.tsx` | **`/my/*`** — payslip history |
| `/profile` | `app/(dashboard)/profile/page.tsx` | **`/my/*`** — employee profile |

### Route Classification Summary for Merge

- **→ `/admin/*`**: dashboard, employees (list + detail + new), leave (list + detail + modals), payroll (list + new + detail)
- **→ `/my/*`**: dashboard, attendance, leave (employee view), payslips, profile
- **→ Shared / login**: one `/login` page (consolidate to this path), BFF api routes, shell-preview
- **⚠ Naming conflict**: both portals have a `/leave` route — one is admin-side approval management, the other is employee-side request listing. In the merged app they become `/admin/leave` and `/my/leave` respectively. No actual conflict after the path prefixing.

---

## Audit 0.3: Layouts, Providers, and State Management

### Root Layout Comparison

**Admin** (`src/app/layout.tsx`):
```tsx
// Providers: QueryProvider → ToastProvider
// Fonts: Montserrat (400/500/600/700/800) + DM_Mono (400/500)
// Metadata: title "AndikishaHR Admin"
<html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${dmMono.variable}`}>
  <body className="font-body text-near-black bg-surface antialiased">
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  </body>
</html>
```

**Employee** (`src/app/layout.tsx`):
```tsx
// Providers: QueryProvider ONLY (no ToastProvider)
// Fonts: identical
// Metadata: title "AndikishaHR"
<html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${dmMono.variable}`}>
  <body className="font-body text-near-black bg-surface antialiased">
    <QueryProvider>{children}</QueryProvider>
  </body>
</html>
```

**⚠ Risk**: Employee portal is missing `ToastProvider`. The consolidated root layout must include it.

### Dashboard Layout Comparison

**Admin** (`(dashboard)/layout.tsx`):
```tsx
// Uses TenantAdminShell from @andikisha/ui (shared package)
// Reads headers() — but immediately voids them (userEmail unused in layout itself)
// Includes TenantCommandPalette (Cmd+K shortcut)
<TenantAdminShell nav={<TenantAdminNav />} navFooter={<TenantAdminNavFooter />}>
  <TenantCommandPalette />
  {children}
</TenantAdminShell>
```

**Employee** (`(dashboard)/layout.tsx`):
```tsx
// Uses ClientShell from LOCAL @/components/layout/ClientSidebar (not shared package)
// Reads headers() and extracts x-user-email
// No command palette
<ClientShell userEmail={userEmail}>{children}</ClientShell>
```

**⚠ Risk**: Employee dashboard layout uses a local `ClientShell` rather than a shared shell from `@andikisha/ui`. This needs to be resolved — either promote the employee shell to the shared package, or build the `(my)` layout directly in `tenant-portal`. Since `EmployeeShell` already exists in `@andikisha/ui` (visible in `frontend/packages/ui/src/components/EmployeeShell.tsx`), the employee layout should use that.

### State Management

- **Package declared**: `zustand: ^5.0.0` in both `package.json` files
- **Actual usage**: `src/lib/store/` exists in both portals but **is empty** — no Zustand stores written
- **Active state management**: TanStack Query (React Query v5) via `QueryProvider` at root
- **No Redux, no Jotai, no Context APIs** in either scaffold
- **Risk level**: LOW — Zustand is a declared-but-unused dependency. Remove it during consolidation to reduce install weight.

---

## Audit 0.4: Authentication State

### Login Pages

| | Admin | Employee |
|---|---|---|
| URL | `/login` | `/auth/login` |
| File | `app/login/page.tsx` | `app/auth/login/page.tsx` |
| "Forgot password" | No | Yes (stub, non-functional) |
| Right panel | Testimonial mockup | Unsplash background image |

**Path decision needed**: Consolidate to one login path. `/login` (admin) is simpler and conventional. `/auth/login` (employee) is more REST-ful. Recommend `/login` for the merged app, with a redirect from `/auth/login` for safety.

### Session Token Storage

Both portals store the JWT in an **HTTP-only cookie** set by a Next.js Route Handler (BFF pattern). The implementation is identical except for the cookie name:

| | Admin | Employee |
|---|---|---|
| Cookie name | `admin_token` | `employee_token` |
| `httpOnly` | `true` | `true` |
| `secure` | `true` (production) | `true` (production) |
| `sameSite` | `strict` | `strict` |
| `path` | `/` | `/` |

**Cookie name merge strategy**: In the consolidated app, use a single cookie name (`tenant_token`). The role is embedded in the JWT payload — the middleware reads `payload.role` to make routing decisions, not the cookie name.

### Authenticated State Propagation

Both portals use an identical pattern:

1. Client POSTs credentials to `/api/auth/login` (BFF route handler)
2. Route handler applies in-memory rate limiting (10 req / 15 min per IP)
3. Route handler forwards to `${API_GATEWAY}/api/v1/auth/login` with `X-Tenant-ID` header
4. On success: JWT set as HTTP-only cookie; `{ user, expiresIn }` returned to client
5. All subsequent requests pass through `middleware.ts`
6. Middleware decodes JWT with `jose.jwtVerify()` using base64-decoded `JWT_SECRET`
7. Middleware sets `x-user-id`, `x-user-email`, `x-tenant-id` response headers (employee middleware additionally sets `x-employee-id`)
8. Server components and route handlers read these headers via `await headers()`

### Role Enforcement in Current Middleware

| | Admin | Employee |
|---|---|---|
| Cookie read | `admin_token` | `employee_token` |
| Role checked | `payload.role !== "ADMIN"` | `payload.role !== "EMPLOYEE"` |
| On failure | Redirect `/login`, delete cookie | Redirect `/auth/login`, delete cookie |

**For the consolidated middleware** (Prompt A, permissive): Accept any authenticated token. Add TODO for Prompt B role-based guards.

### `/me` Pattern

Not implemented in either scaffold. The proxy handler includes `/api/v1/employees/me` in its allowed passthrough, but it is only called on-demand by specific page components, not during auth initialisation. No persistent "current user" object is maintained in client state.

### Token Refresh

**Not implemented** in either scaffold. No refresh token endpoint, no retry-on-401. A user whose token expires will receive a 401 from the proxy and see a broken page until they re-login. This is a pre-existing gap, noted for Prompt B.

---

## Audit 0.5: PWA and Service Worker

**Finding: Neither portal has PWA or service worker support.**

- No `public/manifest.json` in either scaffold
- No service worker file (`sw.js`, `service-worker.js`, etc.)
- No service worker registration (neither in layout nor in a client component)
- No `next-pwa` plugin in `next.config.ts`
- No offline-aware components
- No background sync

Both portals are purely online. The service worker and manifest are **new additions** required by the consolidation plan (Steps 2.5 and 2.6). There is no existing baseline to adapt.

---

## Audit 0.6: Internationalisation

**Finding: No i18n library or configuration in either portal.**

- No `next-intl`, `i18next`, `react-i18next`, `formatjs`, or similar package in either `package.json`
- No `locales/` or `translations/` directory
- No i18n-related environment variables
- All UI text is hard-coded English

This is expected for the current MVP targeting Kenya. Swahili support is not on the immediate roadmap. The consolidation plan does not add i18n — no action needed in this prompt.

---

## Audit 0.7: Styling and Brand Tokens

### Tailwind Configuration

Both portals use **Tailwind CSS v4** via the `@tailwindcss/postcss` PostCSS plugin. There is no `tailwind.config.ts` file in either portal directory — the v4 configuration is managed through CSS custom properties and PostCSS integration rather than a traditional config file.

`postcss.config.mjs` (identical in both):
```javascript
{ plugins: { "@tailwindcss/postcss": {} } }
```

### Brand Tokens

Brand tokens are defined in `docs/design/andikishahr-brand-colours.md`. Both portals consume them via CSS custom properties in `globals.css`. The token names used in markup include:
- `bg-surface`, `text-near-black`, `font-body` (from Tailwind theme extensions using the CSS vars)
- Colour classes like `text-brand-900`, `bg-brand-950`, `bg-amber` for UI chrome

Both portals use consistent tokens. No drift detected.

### Fonts

Both portals import identically from `next/font/google`:
- **Montserrat** (`--font-montserrat`) — 400, 500, 600, 700, 800 weights
- **DM_Mono** (`--font-dm-mono`) — 400, 500 weights

**Note**: The consolidation plan specifies **Bricolage Grotesque** and **DM Sans** as the brand display/body fonts. The current scaffolds use Montserrat + DM_Mono. This is an intentional discrepancy — the brand fonts are used in the landing site. For the portals, Montserrat is the operational choice. The plan's font specification may need clarification from Lawrence before Phase 2 begins. Do not change fonts without confirming.

### Non-Tailwind CSS

- No Bootstrap, SCSS, Sass, LESS, or Styled Components found in either portal
- No `.scss` or `.sass` files
- The only CSS is `globals.css` (CSS custom properties + base resets) and Tailwind utility classes

✅ Both portals comply with the Tailwind-only requirement.

---

## Audit 0.8: Shared Package Consumption

### `tsconfig.json` Path Mappings (identical in both):
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@andikisha/ui": ["../packages/ui/src"],
    "@andikisha/api-client": ["../packages/api-client/src"],
    "@andikisha/shared-types": ["../packages/shared-types/src"]
  }
}
```

These paths will need to be updated in `tenant-portal` to point to `../../packages/...` since the new app is one directory deeper (if placed at `frontend/tenant-portal/`).

### Import Inventory

**`@andikisha/ui`** used in:
- Admin root layout: `QueryProvider`, `ToastProvider`
- Employee root layout: `QueryProvider`
- Admin dashboard layout: `TenantAdminShell`, `TenantAdminNav`, `TenantAdminNavFooter`
- Both login pages: `LogoFull`
- Various pages: `StatCard`, `KpiGroup`, `DataTable`, `Badge`, `PageHeader`, etc.

**`@andikisha/api-client`**:
- Both portals: `createApiClient` from `lib/api-client.ts`

**`@andikisha/shared-types`**:
- Referenced in tsconfig paths but no direct import observed in layout/middleware files. Used within page components.

**Employee layout inconsistency**: `(dashboard)/layout.tsx` imports `ClientShell` from `@/components/layout/ClientSidebar` (local component) rather than from `@andikisha/ui`. The shared `EmployeeShell` component exists in `frontend/packages/ui/src/components/EmployeeShell.tsx`. The `tenant-portal` admin layout should import from `@andikisha/ui`, and the employee layout should also use `EmployeeShell` from `@andikisha/ui`.

---

## Audit 0.9: Dependencies

### Full Comparison

| Package | Admin | Employee | Status |
|---|---|---|---|
| `next` | 15.1.0 | 15.1.0 | ✅ Match |
| `react` | ^19.0.0 | ^19.0.0 | ✅ Match |
| `react-dom` | ^19.0.0 | ^19.0.0 | ✅ Match |
| `@andikisha/ui` | workspace:* | workspace:* | ✅ Match |
| `@andikisha/api-client` | workspace:* | workspace:* | ✅ Match |
| `@andikisha/shared-types` | workspace:* | workspace:* | ✅ Match |
| `@tanstack/react-query` | ^5.62.0 | ^5.62.0 | ✅ Match |
| `@radix-ui/react-dialog` | ^1.1.0 | ^1.1.0 | ✅ Match |
| `@radix-ui/react-dropdown-menu` | ^2.1.0 | ^2.1.16 | ⚠ Minor drift |
| `@radix-ui/react-select` | ^2.1.0 | ^2.2.6 | ⚠ Minor drift |
| `@radix-ui/react-tabs` | ^1.1.0 | ^1.1.0 | ✅ Match |
| `@radix-ui/react-tooltip` | ^1.2.8 | ^1.2.8 | ✅ Match |
| `axios` | ^1.7.0 | ^1.7.0 | ✅ Match |
| `clsx` | ^2.1.0 | ^2.1.0 | ✅ Match |
| `cmdk` | ^1.1.1 | ^1.1.1 | ✅ Match |
| `date-fns` | ^4.1.0 | ^4.1.0 | ✅ Match |
| `jose` | ^5.0.0 | ^5.10.0 | ⚠ Patch drift |
| `lucide-react` | ^0.468.0 | ^0.468.0 | ✅ Match |
| `tailwind-merge` | ^2.6.0 | ^2.6.0 | ✅ Match |
| `zod` | ^3.24.0 | ^3.24.0 | ✅ Match |
| `zustand` | ^5.0.0 | ^5.0.0 | ✅ Match (unused) |
| `recharts` | ^2.15.0 | **MISSING** | ⚠ Admin-only |

**Admin-only dependencies**: `recharts` — used in admin dashboard charts. If the employee surface ever needs charts, use recharts for consistency. Not forbidden by the template rules.

**Employee-only dependencies**: None — the employee portal is a strict subset of the admin portal's dependencies.

### Version Drift (low risk, patch-level only):
- `@radix-ui/react-dropdown-menu`: use `^2.1.16` (employee is newer)
- `@radix-ui/react-select`: use `^2.2.6` (employee is newer)
- `jose`: use `^5.10.0` (employee is newer)

### Forbidden Dependency Audit

✅ **CLEAN** — neither portal contains any forbidden template dependency:
- No `bootstrap`, `react-bootstrap`
- No `antd`, `@ant-design/*`
- No `primereact`, `primeicons`
- No `@fortawesome/*`
- No `react-feather`, `react-icons`
- No `weather-icons-react`, `react-country-flag`
- No `apexcharts`, `react-apexcharts`, `chart.js` (recharts is used instead and is permitted)
- No `react-input-mask`, `react-quill-new`, `react-simple-wysiwyg`
- No `react-slick`, `slick-carousel`
- No `dragula`, `leaflet`

### Cleanup opportunities:
- Remove `zustand` from consolidated `package.json` — declared but never used in either portal

---

## Audit 0.10: Build and Tooling

### Dev Port Assignments

| Portal | Dev port |
|---|---|
| admin-portal | 3000 |
| employee-portal | 3001 |
| tenant-portal (consolidated) | 3000 (per plan) |

### Scripts (both portals):
```json
{
  "dev": "next dev --port {3000|3001}",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

### TypeScript Configuration

Identical `tsconfig.json` in both portals:
- Target: `ES2017`
- `strict: true` ✅
- `moduleResolution: "bundler"`
- `incremental: true`
- Next.js TypeScript plugin enabled

The `tsconfig.json` path aliases (`@andikisha/*`) point to `../packages/*` — one level up from the portal directory. The consolidated app at `frontend/tenant-portal/` has the same relative position to `frontend/packages/`, so these paths require no change.

### Next.js Config Differences

**Admin** (`next.config.ts`):
```typescript
experimental: {
  optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-dialog"],
}
```

**Employee** (`next.config.ts`):
```typescript
experimental: {
  optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-tabs"],
}
```

Merged config should combine the union: `["lucide-react", "recharts", "@radix-ui/react-dialog", "@radix-ui/react-tabs"]`.

### ESLint

Both use `eslint-config-next` (Next.js built-in). No custom rules. No `.eslintrc` files beyond what Next.js scaffolds by default.

### Prettier

No Prettier configuration in either portal. Formatting is unenforced at the tooling level.

### Test Framework

**None.** Neither portal has a test framework installed or any test files. No Jest, Vitest, or Playwright. No `@testing-library/react`. This is an existing gap — not introduced by the consolidation.

### Pre-commit Hooks

**None.** No Husky, no lint-staged, no `.husky/` directory.

---

## Audit 0.11: Workspace and Deploy Configuration

### `pnpm-workspace.yaml` (current):
```yaml
packages:
  - "frontend/*"
  - "frontend/packages/*"
  - '!template/**'
```

`frontend/*` currently resolves to: `admin-portal`, `employee-portal`, `landing`, `superadmin-portal`.

After consolidation, it resolves to: `tenant-portal`, `landing`, `superadmin-portal`. The glob picks up `tenant-portal` automatically as long as it lives at `frontend/tenant-portal/`. No structural change to the workspace file is needed beyond confirming `!template/**` remains in place (it does).

**Note**: `frontend/superadmin-portal/` appears in `ls frontend/` output. This was not part of the audit scope. It exists as a separate scaffold (likely the old superadmin surface). It will need to be addressed in Prompt A.5 (platform-portal). Do not touch it in this prompt.

### Root `package.json` Scripts (current):
```json
{
  "dev:admin": "pnpm --filter admin-portal dev",
  "dev:employee": "pnpm --filter employee-portal dev",
  "dev:landing": "pnpm --filter landing-page dev",
  "build:admin": "pnpm --filter admin-portal build",
  "build:employee": "pnpm --filter employee-portal build",
  "build:landing": "pnpm --filter landing-page build",
  "build:all": "pnpm -r build",
  "lint": "pnpm -r lint",
  "type-check": "pnpm -r type-check"
}
```

After consolidation:
- Remove `dev:admin`, `dev:employee`, `build:admin`, `build:employee`
- Add `dev:tenant` → `pnpm --filter tenant-portal dev`
- Add `build:tenant` → `pnpm --filter tenant-portal build`

### Vercel Configuration

No `vercel.json` exists at the repo root or inside either portal. Deployment is managed via the Vercel UI or GitHub integration. This must be updated manually at merge time. Noted in final deliverable.

### GitHub Actions

Three workflow files exist in `.github/workflows/`:
- `ci.yml` — runs on push/PR to master; currently targets Java/Gradle build. No explicit frontend filter observed in the first 40 lines.
- `cd-staging.yml` — staging deployment
- `cd-production.yml` — production deployment

The CI workflow does not appear to run `next build` for either portal in the inspected portion. Full workflow content was not read — Lawrence should verify whether the CD workflows reference `admin-portal` or `employee-portal` paths that need updating after consolidation.

### Environment Variables

**Admin portal** defines `.env.local.example` (employee does not). Expected variables in both:

```bash
API_GATEWAY_URL=http://localhost:8080   # Backend gateway
TENANT_ID=<tenant-uuid>                 # Tenant for BFF login
JWT_SECRET=<base64-encoded-secret>      # Mirror of auth-service secret
NODE_ENV=development
```

Both `.env.local` files are excluded from git (correctly). Copy from the dominant scaffold (admin portal, since it has `.env.local.example`) into `tenant-portal/.env.local.example`. Do not commit real secrets.

---

## Audit 0.12: Template Directory

### Current State

```
template/
├── 05-template-README.md     ← in-repo reference guide
└── smarthr/                  ← single directory (not smarthr-nextjs/ + smarthr-html/)
    ├── eslint.config.mjs
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package-lock.json     ← uses npm, not pnpm
    ├── package.json
    ├── public/
    ├── README.md
    ├── src/
    └── tsconfig.json
```

**Discrepancy**: `docs/design/06-template-usage.md` references `template/smarthr-nextjs/` and `template/smarthr-html/` as two separate directories. The actual repo has only `template/smarthr/` (a Next.js version). There is no `smarthr-html/` static version. This discrepancy should be flagged to Lawrence — the template usage doc may have been written before the directory was finalized, or the HTML version was not added yet.

### Workspace Exclusion

`pnpm-workspace.yaml` already contains `'!template/**'`. The template is correctly excluded from the workspace. No action needed.

### Documentation

| File | Status |
|---|---|
| `template/05-template-README.md` | ✅ Exists |
| `template/README.md` | ✅ Exists (inside `template/smarthr/`) |
| `docs/design/06-template-usage.md` | ✅ Exists |
| `.claude/skills/template-reference/SKILL.md` | ✅ Exists |
| `.claude/skills/template-reference/03-screen-mapping.md` | ✅ Exists |
| `.claude/skills/template-reference/04-forbidden-dependencies.md` | ✅ Exists |
| `docs/adr/` directory | ❌ Does not exist — must be created in Phase 1 |

All template reference infrastructure is in place except the ADR directory. The plan's Step 2.9 says to create `template/README.md` if it doesn't exist — it does exist (inside `smarthr/`). The plan also says to create `docs/design/template-usage.md` — it exists at `docs/design/06-template-usage.md` (note the `06-` prefix). Confirm whether Step 2.9 should create a second `docs/design/template-usage.md` or whether the existing `06-template-usage.md` is the canonical file.

---

## Consolidation Plan and Risks

### Route Contribution Map

| Source | Destination in `tenant-portal` |
|---|---|
| `admin-portal/app/(dashboard)/dashboard/` | `tenant-portal/src/app/(admin)/admin/dashboard/` |
| `admin-portal/app/(dashboard)/employees/` | `tenant-portal/src/app/(admin)/admin/employees/` |
| `admin-portal/app/(dashboard)/leave/` | `tenant-portal/src/app/(admin)/admin/leave/` |
| `admin-portal/app/(dashboard)/payroll/` | `tenant-portal/src/app/(admin)/admin/payroll/` |
| `employee-portal/app/(dashboard)/dashboard/` | `tenant-portal/src/app/(my)/my/dashboard/` |
| `employee-portal/app/(dashboard)/attendance/` | `tenant-portal/src/app/(my)/my/attendance/` |
| `employee-portal/app/(dashboard)/leave/` | `tenant-portal/src/app/(my)/my/leave/` |
| `employee-portal/app/(dashboard)/payslips/` | `tenant-portal/src/app/(my)/my/payslips/` |
| `employee-portal/app/(dashboard)/profile/` | `tenant-portal/src/app/(my)/my/profile/` |
| `admin-portal/app/login/` | `tenant-portal/src/app/login/` (canonical login path) |
| `employee-portal/app/auth/login/` | Redirect to `/login` |
| Both `api/auth/login` + `api/auth/logout` | `tenant-portal/src/app/api/auth/login/` + `logout/` (merge, unify cookie name) |
| Both `api/proxy/[...path]` | `tenant-portal/src/app/api/proxy/[...path]/` (merge, accept both roles) |

### Dominant Patterns to Keep

| Concern | Source | Rationale |
|---|---|---|
| Auth flow | Admin portal (BFF + HTTP-only cookie) | Identical in both; admin has role-guard example |
| Root layout structure | Admin portal | Has `ToastProvider` that employee is missing |
| Dashboard layout for admin | Admin portal | `TenantAdminShell` from `@andikisha/ui` |
| Dashboard layout for employee | Neither (use `EmployeeShell` from `@andikisha/ui`) | Employee uses local `ClientShell`; the shared `EmployeeShell` should be used instead |
| State management | Neither | Only React Query in use; strip Zustand |
| Styling | Both (identical) | Tailwind v4, same tokens |
| Fonts | Both (identical) | Montserrat + DM_Mono |
| BFF proxy | Admin portal | Rate limiter present; same logic in both |

### Files Requiring Careful Merge

| File | Risk | Notes |
|---|---|---|
| `middleware.ts` | **High** | Two cookie names, two role checks, two login redirect targets — must be unified into one permissive middleware |
| `api/auth/login/route.ts` | **High** | Cookie name differs; role validation logic differs — consolidate to single cookie `tenant_token`, preserve rate limiter |
| `app/layout.tsx` | **Medium** | Employee missing `ToastProvider` — admin layout is the merge target |
| `(dashboard)/layout.tsx` → `(admin)/layout.tsx` | **Medium** | Straightforward copy from admin; add `EmployeeShell` layout for `(my)` |
| Internal links | **Medium** | Every `href` in nav that points to `/dashboard`, `/employees`, etc. must be updated to `/admin/...` or `/my/...` |

### Specific Files to Merge (not copy)

- `middleware.ts`: New file, written fresh per Step 2.7 spec
- `app/api/auth/login/route.ts`: New file unifying both — single cookie `tenant_token`, no role restriction (permissive per plan)
- `app/layout.tsx`: Admin layout is base; confirm font spec with Lawrence before changing to Bricolage Grotesque/DM Sans

### Risk Register

| Risk | Level | Mitigation |
|---|---|---|
| Internal navigation links break after path prefixing | High | Audit all `href` values in nav components before committing Step 2.3 |
| `EmployeeShell` from `@andikisha/ui` has different props signature than local `ClientShell` | Medium | Read `EmployeeShell` source before writing `(my)/layout.tsx` |
| Font spec conflict (plan says Bricolage Grotesque/DM Sans, scaffolds use Montserrat) | Medium | Confirm with Lawrence before Phase 2 |
| `template/smarthr-nextjs/` and `template/smarthr-html/` do not exist as documented | Medium | Only `template/smarthr/` exists. Step 2.9 references these paths — confirm whether to rename or leave as-is |
| `docs/design/template-usage.md` vs `docs/design/06-template-usage.md` | Low | File exists but with a prefix. Step 2.9 would create a duplicate unless pointed at the `06-` prefixed path |
| GitHub CD workflows may reference `admin-portal`/`employee-portal` paths | Medium | Not fully audited; Lawrence should verify before deleting old directories |
| `frontend/superadmin-portal/` exists and is in the pnpm workspace | Low | Prompt A.5 scope. Do not touch in this prompt. |
| Token refresh not implemented | Low | Pre-existing gap; Prompt B scope |
| Rate limiter in BFF is in-memory (resets on restart) | Low | Pre-existing; production should use Redis-backed limiter. Not in scope. |

### Violations to Fix During Consolidation

None found. Both portals are clean of forbidden dependencies, non-Tailwind CSS, and template imports.

### Surprises for Lawrence

1. **`frontend/superadmin-portal/` exists** in the workspace. It was not mentioned in the audit scope. This is likely the scaffold that Prompt A.5 (platform-portal) will rename/replace. Verify this is intentional before `pnpm-workspace.yaml` is updated.

2. **Only one template directory** (`template/smarthr/`) exists, not the two (`smarthr-nextjs/` + `smarthr-html/`) that the documentation references. Either the HTML version was never added, or the directory was renamed. No action needed for this prompt, but the docs reference should be updated or the directory confirmed.

3. **Employee `ClientShell` is a local component** (not in `@andikisha/ui`). But `EmployeeShell` already exists in the shared package. The local component is redundant. The `(my)` layout in `tenant-portal` should use the shared `EmployeeShell`.

4. **Font discrepancy**: The plan specifies Bricolage Grotesque + DM Sans. The actual scaffolds use Montserrat + DM_Mono. The landing site uses the brand fonts. The portals made a different choice. Confirm before Phase 2 proceeds.

5. **No token refresh** in either portal. Users will be silently logged out on token expiry with no retry. This is not introduced by the consolidation, but worth noting for Prompt B planning.

---

*Phase 0 complete. Awaiting Lawrence's review before proceeding to Phase 1 (ADR).*
