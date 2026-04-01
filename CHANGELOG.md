# Changelog

All notable changes to AndikishaHR are documented here.

---

## [Unreleased] — 2026-04-01

### Frontend — pnpm Workspace Bootstrap

#### Fixed
- **pnpm workspace resolution error** — `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for `@andikisha/api-client`, `@andikisha/shared-types`, and `@andikisha/ui`. All three shared packages were missing their `package.json` files. The `@andikisha/shared-types` manifest was misplaced at `frontend/packages/package.json` instead of inside its own subdirectory.
  - Created `frontend/packages/api-client/package.json`
  - Created `frontend/packages/shared-types/package.json` (moved from wrong location)
  - Created `frontend/packages/ui/package.json`
  - Removed the misplaced `frontend/packages/package.json`
  - `pnpm install` now resolves all 6 workspace packages cleanly

#### Added
- **`@andikisha/shared-types`** (`frontend/packages/shared-types/src/index.ts`) — TypeScript interfaces for `Employee`, `EmploymentStatus`, `LoginRequest`, `TokenResponse`, `UserProfile`, `PageResponse`, `ApiError`, and `FieldError`
- **`@andikisha/api-client`** (`frontend/packages/api-client/index.ts`) — Axios client with:
  - JWT `Authorization` header injection from `localStorage`
  - `X-Tenant-ID` header injection per request
  - Automatic silent token refresh on HTTP 401 using the refresh token
  - Redirect to `/auth/login` on refresh failure
  - Typed `RetryableConfig` interface extending `InternalAxiosRequestConfig` to safely carry the `_retry` flag
- **`@andikisha/ui`** (`frontend/packages/ui/src/`) — Shared component library with:
  - `cn()` utility — `clsx` + `tailwind-merge` class name helper
  - `Button` component — `forwardRef` component with `variant` (primary, secondary, outline, danger, ghost) and `size` (sm, md, lg) props, built on Tailwind CSS v4

#### Added — employee-portal Bootstrap
The `employee-portal` `src/` directory was empty and had no `tsconfig.json` or `next.config.ts`. The portal is now fully bootstrapped:
- `src/app/layout.tsx` — root layout with metadata and `suppressHydrationWarning`
- `src/app/page.tsx` — placeholder home page
- `src/app/globals.css` — Tailwind CSS v4 import
- `next.config.ts` — mirrors admin-portal config with shared package transpilation and `output: "standalone"`
- `tsconfig.json` — strict TypeScript config matching admin-portal with path aliases for all three shared packages

---

### TypeScript — Type Safety Fixes

#### Fixed
- **`api-client` — `process` not found (TS2580)** — `tsconfig.json` was missing `"types": ["node"]` and `@types/node` was absent from `devDependencies`. Both now added; `process.env.NEXT_PUBLIC_API_URL` resolves correctly.
- **`api-client` — unused `ApiError` import** — Removed unused `ApiError` from the import in `index.ts`.
- **`api-client` — implicit `any` on interceptor error** — The Axios response interceptor error callback was untyped (`any`). Changed to `error: AxiosError` with a `RetryableConfig` interface extending `InternalAxiosRequestConfig` for the `_retry` flag. Added `null` check on `originalRequest` before access.
- **`ui` — missing return type on exported function** — Added explicit `: string` return type to the exported `cn()` function in `utils.ts`.
- **`ui/Button` — missing `displayName`** — Added `Button.displayName = "Button"` to the `forwardRef` component for correct React DevTools labelling.

#### Added
- **`api-client/tsconfig.json`** — New TypeScript config (`target: ES2017`, `lib: ES2017 + DOM`, `types: node`, `moduleResolution: Bundler`, `strict: true`) covering both `src/` and root `index.ts`.

---

### Hydration

#### Fixed
- **React hydration mismatch on `<html>` element** — Browser extensions (e.g. accessibility/highlighting tools) inject CSS custom properties (`--ra-highlight-*`) onto the `<html>` tag before React hydrates, causing a server/client attribute mismatch. Added `suppressHydrationWarning` to the `<html>` element in:
  - `admin-portal/src/app/layout.tsx`
  - `employee-portal/src/app/layout.tsx`

---

### Tooling

#### Added
- **`.nvmrc`** — Pinned Node.js runtime to `20.19.0` (Node 20 LTS "Iron"), consistent with the `"node": ">=20.0.0"` engine constraint in `package.json`.

---

### Skills (Claude Code)

#### Added
- **`typesafety` skill** (`~/.claude/skills/typesafety/SKILL.md`) — 8-phase TypeScript type safety audit skill:
  - Phase 1: Environment detection (tsconfig, ESLint, package manager)
  - Phase 2: TypeScript compiler scan with error code classification
  - Phase 3: ESLint type-aware scan (`@typescript-eslint` integration) with fallback grep patterns; explicitly avoids unreliable `!` grep in favour of ESLint's `no-non-null-assertion` rule
  - Phase 4: `tsconfig` strict flag audit (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`)
  - Phase 5: Severity classification (High/Medium/Low/Advisory)
  - Phase 6: Fix patterns for `as any`, non-null assertions, implicit `any`, floating promises, `@ts-ignore`, missing return types
  - Phase 7: Verification (tsc + ESLint re-run, test suite)
  - Phase 8: Structured audit report
