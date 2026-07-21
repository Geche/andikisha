# Claude Code Prompt A: Frontend Portal Consolidation

## What you are doing

You are merging two existing Next.js scaffolds, `frontend/admin-portal/` and `frontend/employee-portal/`, into a single Next.js 15 app called `tenant-portal`. This is the customer-facing surface of AndikishaHR for tenants. Internal Andikisha staff will use a separate `platform-portal` app, which is NOT part of this work and lands in Prompt A.5.

This prompt covers ONLY the frontend consolidation. It does NOT touch the backend. It does NOT implement role-aware middleware. It does NOT add multi-role support. Those land in Prompt B.

Work in three phases. Do not start a later phase before Lawrence has reviewed and approved the deliverable of the previous phase. If you find yourself wanting to fix something beyond the scope of this prompt, write it in the audit report and ask before doing anything.

---

## Architectural context

After this PR merges, the `frontend/` directory looks like this:

```
frontend/
  tenant-portal/    (port 3000)  customer-facing: HR, payroll, employee self-service
  platform-portal/  (port 3003)  internal Andikisha staff (scaffolded in Prompt A.5)
  landing/          (port 3002)  marketing site (untouched)
```

Inside `tenant-portal`, routes are organised under two path-scoped segments using Next.js App Router route groups:

- `/my/*` for employee self-service. Everyone uses this, including LINE_MANAGER for their My Team section.
- `/admin/*` for HR, payroll, compliance, and settings. For ADMIN, HR_MANAGER, PAYROLL_OFFICER, and HR.

LINE_MANAGER does NOT route to `/admin/*`. They are an EMPLOYEE who happens to manage a team. Their team-management surface (My Team) lives inside `/my/*` as a conditional section that renders when LINE_MANAGER is present in their role set. Do not put LINE_MANAGER content in `/admin/*` under any circumstances.

A path-scoped service worker registers ONLY for `/my/*`. This gives the employee surface offline-first behaviour where it matters, without forcing offline support on admin surfaces that don't need it.

Multi-role users (a user holding both EMPLOYEE and HR_MANAGER, for example) are handled in Prompt B. For this prompt, the middleware is intentionally permissive: any authenticated user can access any route, with TODO comments where the real role guards will land. This unblocks the consolidation without waiting for the backend changes.

The default landing route at `/` redirects to `/my/dashboard` for any authenticated user. The role-aware redirect lands in Prompt B alongside the real guards.

### Design references

A commercial admin template (SmartHR by Dreams Technologies) lives at `template/smarthr-nextjs/` and `template/smarthr-html/`. It is read-only reference material, not source code. It exists to inform visual layout decisions and feature blueprints, especially for the `platform-portal` Super Admin section.

Three rules apply to the template, enforced everywhere in this prompt:

1. Use it for visual reference and feature blueprint only. Study the structure of screens, then rebuild in the AndikishaHR stack.
2. Never import from `template/*` in production code. Never add the template's dependencies (Bootstrap, react-bootstrap, antd, primereact, FontAwesome, react-feather, react-icons, weather icons) to either app.
3. Only build features that are on the AndikishaHR Phase 1 to Phase 4 roadmap. The template contains CRM, Recruitment, Accounting, Project Management, and other surfaces that are not in scope.

The full rules of engagement are in `docs/design/system/template-usage.md` and the Claude Code skill at `.claude/skills/template-reference/SKILL.md`. Read both before starting Phase 2.

---

## Phase 0: Audit (read-only, no code changes)

Inspect each item below and produce a single Markdown report at `../audits/2026-05-13-tenant-portal-consolidation-audit.md` in the repo root. Do not write any production code in this phase. The only file you create is the audit report.

### Audit 0.1: Scaffold inventory

For both `frontend/admin-portal/` and `frontend/employee-portal/`:

- Produce a directory tree two levels deep, ignoring `node_modules`, `.next`, `dist`
- Note total file count and a rough sense of which scaffold has more substantive code
- Identify any unexpected directories or files

### Audit 0.2: Route structure

Document the App Router structure of each scaffold. List every route (page, layout, loading, error, route handler). For each, classify it as:

- Belongs in `/my/*` (employee self-service: dashboard, payslips, leave, attendance, expenses, profile)
- Belongs in `/admin/*` (HR, payroll, compliance, settings, reports)
- Shared infrastructure (login, error pages, root layout)
- Unclear, needs discussion

### Audit 0.3: Layouts, providers, and state management

For each scaffold, document:

- The contents of `app/layout.tsx`
- Which React context providers are wrapped at the root (auth, query client, theme, i18n)
- The state management library in use (Redux Toolkit, Zustand, Jotai, React Context, server actions only). Look in `package.json`, in `src/store/` or `src/state/`, and in the root layout. State management was not previously confirmed; this audit must resolve it.
- How the app initialises on first load
- Any differences in provider order or configuration between the two scaffolds

If the two scaffolds use different state management libraries, flag this as a high-risk merge item.

### Audit 0.4: Authentication state

For each scaffold:

- Is there a working login page? Where is it?
- How is the session token stored (HTTP-only cookie, `localStorage`, in-memory)?
- How is authenticated state propagated through the tree?
- Is there a `/me` call pattern or equivalent?
- How are token refreshes handled?

### Audit 0.5: PWA and service worker

For each scaffold:

- Is there an existing service worker registration?
- What is its scope?
- Is there a PWA manifest?
- What caching strategies are configured?
- Are there any offline-aware components?

### Audit 0.6: Internationalisation

For each scaffold:

- Is i18n configured?
- Which locales (English, Swahili per the planning document)?
- Library used (next-intl, react-intl, or similar)
- Translation file structure

### Audit 0.7: Styling and brand tokens

For each scaffold:

- Tailwind configuration (especially `tailwind.config.ts`)
- Brand colour tokens used
- Compare against `../design/brand/andikishahr-brand-colours.md` in the project root
- Note any drift between the two scaffolds

Confirm that Tailwind is the only CSS framework. If you find Bootstrap, SCSS files, or any other styling system, flag it as a violation that must be removed before the consolidation completes.

### Audit 0.8: Shared package consumption

For each scaffold, document how it consumes:

- `@andikisha/ui`
- `@andikisha/api-client`
- `@andikisha/shared-types`

Note any inconsistencies in import paths, version pinning, or wrapper components.

### Audit 0.9: Dependencies

Compare `package.json` of both scaffolds:

- Dependencies present in one but not the other
- Version mismatches for the same dependency
- Dev dependencies and their differences
- Any deprecated or unmaintained packages

Cross-check against the forbidden list. If you find `bootstrap`, `react-bootstrap`, `antd`, `primereact`, `@fortawesome/*`, `react-feather`, `react-icons`, `weather-icons-react`, or `react-country-flag` in either scaffold's `package.json`, flag it as a violation. These are template-only dependencies and must not appear in either app.

### Audit 0.10: Build and tooling

For each scaffold:

- pnpm scripts (dev, build, lint, test, start)
- TypeScript configuration (`tsconfig.json`)
- ESLint and Prettier config
- Test framework (Vitest, Jest, Playwright)
- Any pre-commit hooks or CI scripts that reference these directories

### Audit 0.11: Workspace and deploy configuration

- Current `pnpm-workspace.yaml`
- Root `package.json` scripts that reference either portal
- Any Vercel `vercel.json` or deploy configuration
- Any GitHub Actions or CI configuration that runs on changes to these directories
- Environment variable files (`.env`, `.env.local`, `.env.example`) and what they contain

### Audit 0.12: Template directory

Check whether `template/smarthr-nextjs/` and `template/smarthr-html/` already exist in the repo. Document:

- Whether one or both directories are present
- Whether `template/README.md` exists
- Whether `template/**` is already excluded from `pnpm-workspace.yaml` via a negative glob (`!template/**`)
- Whether `docs/design/system/template-usage.md` exists
- Whether `.claude/skills/template-reference/SKILL.md` exists

If any of these are missing, note them in the audit. They will be created in Phase 2.

### Audit deliverable

Produce `../audits/2026-05-13-tenant-portal-consolidation-audit.md` with one section per audit task. End with a "Consolidation plan and risks" section listing:

- Which scaffold contributes which routes to the merged app
- The dominant patterns to keep (auth flow, layout structure, state management, styling, i18n)
- Specific files that need careful merging (conflicting layouts, duplicate components)
- Estimated risk for each non-trivial merge (low, medium, high)
- Any violations of the forbidden-dependency rule that must be fixed
- Anything unexpected that Lawrence needs to know about before Phase 2 begins

Stop after writing this file. Do not proceed to Phase 1.

---

## Phase 1: Architectural decision record

Once Lawrence approves the audit, create a single file: `docs/decisions/0001-single-tenant-portal.md`.

The ADR documents:

- **Context**: two portal scaffolds exist, only ADMIN and EMPLOYEE roles have a portal to log into, five of the seven roles are stranded, the model is incomplete.
- **Decision**: consolidate into one `tenant-portal` with `/my/*` and `/admin/*` route groups. Defer role-aware middleware to Prompt B. Defer the platform-portal scaffold to Prompt A.5.
- **Alternatives considered**: keep two apps with loosened gates; collapse everything (including platform-portal) into one app.
- **Rule for what goes where**: `/my/*` is anything an EMPLOYEE can do, including conditional surfaces like My Team for LINE_MANAGER. `/admin/*` is anything that requires an admin-side role. `/super-admin/*` lives in the separate `platform-portal` app.
- **Template usage policy**: reference document at `docs/design/system/template-usage.md` defines the rules of engagement for the SmartHR template. Production code does not import from `template/*`.
- **Consequences**: single auth flow, single deployment, multi-role users no longer need to switch apps, simpler operational surface.

Commit the ADR. Do not start Phase 2 until Lawrence has reviewed.

---

## Phase 2: Consolidation

Each step below is a discrete commit. Run the dev server after each step that could break the boot. Do not batch steps.

### Step 2.1: Create the new directory

Create `frontend/tenant-portal/` with the Next.js 15 App Router structure. Start by copying the more substantive scaffold (per the audit) as the base, then renaming the directory. Update `package.json` so the package name is `tenant-portal` and the port is 3000.

The directory structure at the end of this step uses route groups for `(my)` and `(admin)` with the URL segment nested inside:

```
frontend/tenant-portal/
  src/
    app/
      layout.tsx
      page.tsx
      (my)/
        layout.tsx
        my/
          dashboard/page.tsx
          payslips/page.tsx
          leave/page.tsx
          ...
      (admin)/
        layout.tsx
        admin/
          dashboard/page.tsx
          employees/page.tsx
          payroll/page.tsx
          ...
    components/
    lib/
    middleware.ts
  public/
    manifest.json
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.ts
```

The route group lets each segment have its own layout (different chrome, different nav) while sharing the root `app/layout.tsx`.

### Step 2.2: Move employee-portal routes into `(my)`

For each route identified in the audit as belonging to `/my/*`:

- Move the page, loading, and error files into the corresponding `(my)/my/...` path
- Update internal links to use the new path prefix
- Preserve the component code as-is unless the audit flagged something specific

After this step, the dev server should boot and every former employee-portal route should be reachable at its new `/my/...` path.

### Step 2.3: Move admin-portal routes into `(admin)`

Same as 2.2, but for admin routes into `(admin)/admin/...`.

After this step, both former portals' routes work, served from one app.

### Step 2.4: Single root layout and providers

Consolidate the two root layouts into one at `src/app/layout.tsx`. The dominant pattern from the audit wins. The merged root layout:

- Includes the auth provider, query client provider, theme provider, i18n provider in the order the audit recommends
- Includes the state management provider (whatever the audit identified)
- Loads `next/font` for Bricolage Grotesque and DM Sans (per the brand)
- Sets `<html lang>` based on the user's language preference (English default, Swahili available)
- Renders `{children}` with no opinion on inner chrome

The `(my)/layout.tsx` and `(admin)/layout.tsx` route group layouts handle the chrome (sidebar, top bar, nav). They differ visually: `/admin/*` is dense desktop chrome, `/my/*` is mobile-friendly chrome.

When designing the layout chrome, consult `template/smarthr-html/` (or `template/smarthr-nextjs/`) for structural inspiration. Apply the three rules in `docs/design/system/template-usage.md`: visual reference only, no code copied, no template dependencies added. The chrome you build uses Tailwind, Lucide React, Bricolage Grotesque, DM Sans, and brand tokens from `../design/brand/andikishahr-brand-colours.md`.

### Step 2.5: Path-scoped service worker

Register a service worker that scopes to `/my/*` only. The recommended pattern:

- Place the service worker file at `public/sw-my.js`
- Register it from a client component that only mounts inside the `(my)` route group layout
- Set `scope: '/my/'` in the registration
- Use a cache-first strategy for the employee shell, network-first for API calls

If the audit found that one of the scaffolds already had a service worker, adapt that one rather than starting from scratch. The cache name should include a version suffix so future updates invalidate cleanly.

The `(admin)` layout does NOT register a service worker.

### Step 2.6: PWA manifest

A single `public/manifest.json` for the app. The manifest:

- Uses the brand colours from `../design/brand/andikishahr-brand-colours.md`
- Sets `start_url` to `/my/dashboard` (the employee surface is the one that benefits from PWA installation; admins use desktop)
- Sets `scope` to `/my/` to match the service worker
- Includes icons in the standard sizes (192, 512, plus an Apple touch icon)
- Sets `name` to "AndikishaHR" and `short_name` to "Andikisha"

### Step 2.7: Temporary permissive middleware

Create `src/middleware.ts` with the following behaviour:

- If the user has a valid session token, allow the request to proceed to any route under `/my/*` or `/admin/*`
- If the user does not have a valid session token, redirect to `/login`
- Validate the token by checking its presence and expiry. Do NOT call auth-service in this prompt. The session detection is local-only for now.
- Add TODO comments above the relevant lines explaining that real role-based guards land in Prompt B:

```typescript
// TODO(prompt-b): replace permissive auth check with role-aware guards.
// /my/* requires EMPLOYEE. /admin/* requires any of {ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR}.
// LINE_MANAGER routes through /my/* and sees the My Team section conditionally.
```

### Step 2.8: Default landing route

`src/app/page.tsx` (the root `/`):

- If the user is authenticated, redirect to `/my/dashboard`
- If not, redirect to `/login`

Add a TODO comment:

```typescript
// TODO(prompt-b): replace with role-aware redirect.
// SUPER_ADMIN routes to platform-portal (separate app).
// Any admin-side role lands at /admin/dashboard.
// Otherwise lands at /my/dashboard.
```

### Step 2.9: Template directory hygiene

Ensure the template directory exists and is properly isolated from the workspace.

If `template/smarthr-nextjs/` or `template/smarthr-html/` are missing from the audit, note this in the final report (Lawrence will place them manually).

Update `pnpm-workspace.yaml` at the repo root to exclude `template/**` from being picked up as a workspace package:

```yaml
packages:
  - 'frontend/*'
  - 'services/*'
  - 'shared/*'
  - '!template/**'
```

Create `template/README.md` if it doesn't exist, with content explaining that the directory is read-only reference material, with the three rules of engagement, and pointing to `docs/design/system/template-usage.md` for the full reference.

Create `docs/design/system/template-usage.md` if it doesn't exist, using the content Lawrence supplies (delivered alongside this prompt).

Create `.claude/skills/template-reference/SKILL.md` if it doesn't exist, using the content Lawrence supplies (delivered alongside this prompt).

### Step 2.10: Update workspace and deploy configuration

Update `pnpm-workspace.yaml` at the repo root:

- Add `frontend/tenant-portal` to the workspace packages
- Remove or comment out the entries for `frontend/admin-portal` and `frontend/employee-portal`
- Ensure the `!template/**` exclusion from Step 2.9 is in place

Update the root `package.json` scripts:

- Replace any references to `admin-portal` or `employee-portal` with `tenant-portal`
- Update the convenience scripts (`pnpm dev:tenant`, `pnpm build:tenant`, and so on)

If a `vercel.json` exists at the repo root or inside either old portal, update it to point at `frontend/tenant-portal`. If no `vercel.json` exists, leave Vercel project configuration for Lawrence to handle manually at merge time. Note this in the final report.

Verify environment variable files: copy `.env.example` and `.env.local` from whichever scaffold had them, into the new `tenant-portal` directory. Ensure no real secrets are committed.

### Step 2.11: Smoke test

Before deleting the old directories, verify:

- `pnpm install` at the repo root succeeds
- `pnpm dev --filter tenant-portal` boots
- `/login` renders
- `/my/dashboard` renders (after login or with permissive middleware mocked)
- `/admin/dashboard` renders
- The service worker registers when navigating to `/my/*` and does not register when navigating to `/admin/*`
- The PWA manifest validates (check in Chrome DevTools > Application > Manifest)
- `pnpm build --filter tenant-portal` succeeds with no errors
- The `template/` directory is not part of the install graph (confirm by running `pnpm list --filter tenant-portal` and checking that no template dependencies appear)

If any of these fail, fix before continuing.

### Step 2.12: Delete the old portal directories

Once Step 2.11 passes:

- Delete `frontend/admin-portal/`
- Delete `frontend/employee-portal/`
- Run `pnpm install` again to refresh the lockfile
- Verify the workspace still resolves cleanly

The git history retains the moved files via the rename detection in the earlier commits.

### Step 2.13: Update project documentation

Update the following files to reflect the new structure:

- `CLAUDE.md`: update any references to the two-portal model. Add a new section under "Frontend conventions" explaining the `/my/*` and `/admin/*` route groups, the rule that LINE_MANAGER routes through `/my/*`, and the template reference policy.
- `AndikishaHR_Product_Planning_Document_v1.1.md`: amend section 4 (System Architecture Considerations) to note that the customer-facing frontend is a single Next.js app, not two. Note that `platform-portal` is a separate app for SUPER_ADMIN.
- The implementation status table at the bottom of the planning doc: replace the "Admin Portal" and "Employee Portal" rows with a single "Tenant Portal" row.

If an engineering handbook exists in the repo, update its frontend section as well.

---

## Acceptance criteria

When this PR is ready for review, Lawrence should be able to:

1. Run `pnpm install` at the repo root and see no errors.
2. Run `pnpm dev --filter tenant-portal` and see the dev server boot on port 3000.
3. Navigate to `http://localhost:3000/login`, see the login page render.
4. Navigate to `http://localhost:3000/my/dashboard`, see the employee dashboard render.
5. Navigate to `http://localhost:3000/admin/dashboard`, see the admin dashboard render.
6. Open Chrome DevTools on `/my/dashboard`, see the service worker registered with scope `/my/`.
7. Open Chrome DevTools on `/admin/dashboard`, see no service worker registered.
8. Run `pnpm build --filter tenant-portal` and see a successful production build.
9. See no remaining references to `admin-portal` or `employee-portal` in the repo (excluding `docs/decisions/0001-single-tenant-portal.md` which documents the history).
10. See `frontend/landing/` unchanged.
11. See `template/README.md`, `docs/design/system/template-usage.md`, and `.claude/skills/template-reference/SKILL.md` in place.
12. Confirm `pnpm-workspace.yaml` excludes `template/**` from the workspace.
13. Confirm no template dependencies (Bootstrap, antd, primereact, FontAwesome, react-feather, etc.) appear in `frontend/tenant-portal/package.json`.

---

## Constraints

The backend is not touched. No service in `services/` should have any code change as a result of this prompt. If you find yourself wanting to modify a backend service, stop and surface it.

The landing site at `frontend/landing/` is not touched. It is a separate product, separately deployed.

All shared package imports (`@andikisha/ui`, `@andikisha/api-client`, `@andikisha/shared-types`) continue to work exactly as they did. No package boundary changes.

No business logic changes. This is a structural merge. If the audit finds business logic in either scaffold that needs revision, write it in the report and ask before changing anything.

The middleware in this prompt is intentionally permissive. Do not implement role-based guards. Do not call `/api/v1/auth/me` or any other auth endpoint that doesn't already exist. The real guards land in Prompt B.

LINE_MANAGER content does not belong in `/admin/*`. If you see anything in the existing admin-portal scaffold that looks like LINE_MANAGER-specific UI, flag it in the audit and move it to `/my/*` during consolidation.

### Template constraints

The SmartHR template at `template/smarthr-nextjs/` and `template/smarthr-html/` is read-only reference material. Three rules apply throughout this prompt, enforced in every step:

1. No file in `frontend/tenant-portal/` may contain an `import` that references `template/*`.
2. No template-only dependency may appear in `frontend/tenant-portal/package.json`. The forbidden list includes: `bootstrap`, `react-bootstrap`, `antd`, `primereact`, `@fortawesome/*`, `react-feather`, `react-icons`, `weather-icons-react`, `react-country-flag`, `react-input-mask`, `react-quill-new`, `react-simple-wysiwyg`, `react-slick`, `slick-carousel`, `dragula`, `leaflet`, `apexcharts`, `react-apexcharts`, `chart.js` (use a single chart library chosen for AndikishaHR, not multiple).
3. No Bootstrap classes (`btn`, `card`, `row`, `col-`, `mb-3`, `d-flex`, and so on) and no SCSS files in `frontend/tenant-portal/`. The CSS framework is Tailwind only.

The `template/` directory is excluded from `pnpm-workspace.yaml` via `!template/**`. Do not change this.

When designing layout chrome or any new visual surface, consult `template/smarthr-html/` for structural reference, then rebuild in the AndikishaHR stack. The Super Admin section is most useful for Prompt A.5 (platform-portal) but its layout patterns can inform Step 2.4 as well.

All Flyway, gRPC, and Java backend conventions remain untouched. This is frontend-only work.

---

## How to report progress

After Phase 0, produce `../audits/2026-05-13-tenant-portal-consolidation-audit.md` and stop. Wait for approval.

After Phase 1, commit the ADR and stop. Wait for approval.

After each Phase 2 step, commit, then produce a one-paragraph summary in chat covering what changed, what was verified, and what manual verification Lawrence should do before the next step.

At the end, produce a final summary listing:

- Every file created
- Every file modified
- Every file deleted
- The Vercel configuration status (updated automatically, or left for Lawrence to handle)
- Any TODOs in code that Prompt B will resolve
- Confirmation that no template imports or dependencies leaked into `frontend/tenant-portal/`
- Any surprises encountered along the way

If at any point an audit assumption turns out to be wrong about the actual state of the code, stop, update the audit report, and surface it for review before continuing.
