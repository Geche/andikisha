# Prompt B — Role-Aware Auth Design

**Date:** 2026-05-14  
**Branch:** `feature/prompt-b-auth`  
**Status:** Approved — ready for implementation plan

---

## 1. Goals

Replace four `TODO(prompt-b)` stubs with production-quality auth hardening:

1. Middleware role guards — `/admin/*` and `/my/*` enforce role-set membership using set semantics, forward role headers, redirect cross-surface mismatches silently
2. `CurrentUserProvider` hybrid upgrade — SSR-hydrated from server headers, background-revalidated via React Query with 60-second stale time
3. BFF `/api/auth/me` route — proxies to the backend's existing `GET /api/v1/auth/me`, normalises the single-role response into the multi-role `CurrentUser` shape
4. Smart login redirect — role-aware post-login navigation; SUPER_ADMIN rejected at the BFF login route with a clear message

Shared foundation:

5. `findCorrectDashboard` utility in `@andikisha/ui/lib/auth.ts` — single source of truth for role-to-URL routing, consumed by middleware, login page, and any "go home" link in UI
6. Platform-portal minimal safety net — create `frontend/platform-portal/src/middleware.ts` that rejects non-SUPER_ADMIN users and redirects them to tenant-portal

---

## 2. Out of Scope for This Prompt

| Item | Reason | When |
|---|---|---|
| `fullName` on `User` entity | Auth-service has no name column; belongs in user profile prompt with schema migration + backfill design | Dedicated user profile prompt |
| `fullName` on `UserResponse` / BFF | Nothing to map from until the entity has the field | Same as above |
| JWT `roles[]` array (multi-role in token) | B1 — requires auth-service schema change + token rebuild | Prompt B1 |
| `/me` returning `permissions`, `managedDepartmentIds`, `tenantTier` | B2 | Prompt B2 |
| Platform-portal full shell (HorizontalShell, nav, pages) | Prompt A.5 | Prompt A.5 |
| End-to-end cross-portal redirect verification | Platform-portal not running yet | Verified in Prompt A.5 acceptance criteria |

---

## 3. Role Model Reference

```
SUPER_ADMIN   — Andikisha operator only. Lives in platform-portal. Blocked from tenant-portal.
ADMIN         — Tenant HR administrator. /admin/* surface.
HR_MANAGER    — /admin/* surface.
PAYROLL_OFFICER — /admin/* surface.
HR            — /admin/* surface.
LINE_MANAGER  — Additive role. Always paired with EMPLOYEE. Routes through /my/* only.
                My Team section renders conditionally when LINE_MANAGER is in the role set.
EMPLOYEE      — Baseline self-service role. /my/* surface.
```

**Key invariant:** LINE_MANAGER always accompanies EMPLOYEE. No user holds LINE_MANAGER without EMPLOYEE. The `/my/*` admission check is `roleSet.has('EMPLOYEE')` — LINE_MANAGER is not an admission criterion, only a content-visibility flag within `/my/*`.

---

## 4. Cookie Names (Locked)

| Portal | Cookie | Reason |
|---|---|---|
| tenant-portal | `tenant_token` | Preserves existing sessions — renaming would log everyone out |
| platform-portal | `platform_token` | Different name prevents browser collision when both portals run on localhost |

---

## 5. Component-by-Component Design

### 5.1 `@andikisha/ui/lib/auth.ts` (new file)

Exports pure functions and constants. No React, no side effects. Used by both portals' middleware (via build-time tree-shaking) and by client components.

```ts
/**
 * EDGE RUNTIME SAFE — this file must remain pure:
 * - No React imports, hooks, or JSX
 * - No Node.js built-ins (fs, crypto, etc.)
 * - No dynamic requires
 * Next.js middleware runs in the Edge runtime. This file is imported via the
 * './auth' subpath export to avoid bundling the barrel (which includes React).
 */

export const ADMIN_ROLES = new Set(['ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'HR'] as const);
export const EMPLOYEE_ROLES = new Set(['EMPLOYEE'] as const);

/**
 * Returns the canonical dashboard URL for the given user's role set.
 * Used by middleware (redirect on mismatch), login page (post-login navigate),
 * and any "go home" link in the UI.
 *
 * SUPER_ADMIN redirects to the platform portal (cross-origin).
 * Returns '/access-denied' when no env var is set and the user is SUPER_ADMIN,
 * or when the role set has no recognised roles.
 */
export function findCorrectDashboard(roles: Set<string>): string {
  if (roles.has('SUPER_ADMIN')) {
    return process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? '/access-denied';
  }
  if ([...ADMIN_ROLES].some(r => roles.has(r))) return '/admin/dashboard';
  if (roles.has('EMPLOYEE')) return '/my/dashboard';
  return '/access-denied';
}
```

**Edge runtime note:** Next.js middleware runs in the Edge runtime and cannot import React components. Importing `findCorrectDashboard` from the `@andikisha/ui` barrel (`src/index.ts`) would bundle React hooks and fail at build time.

Fix: add a subpath export to `packages/ui/package.json`:

```json
"exports": {
  ".": "./src/index.ts",
  "./auth": "./src/lib/auth.ts"
}
```

Middleware and login page import via the subpath: `import { findCorrectDashboard } from '@andikisha/ui/auth'`. The barrel export in `src/index.ts` uses the same source: `export { findCorrectDashboard, ADMIN_ROLES, EMPLOYEE_ROLES } from './lib/auth'`. Two entry points, one source file.

### 5.2 `CurrentUser` type (updated in `useCurrentUser.tsx`)

```ts
export interface CurrentUser {
  userId: string;
  tenantId: string;
  email: string;
  /**
   * Not yet populated — auth-service does not store user names.
   * Populated by the future user-profile feature (own schema migration + design prompt).
   * UI components should fall back to email or initials derived from the email local-part.
   */
  fullName?: string;
  /** Array because one user may hold multiple roles. Today always a singleton (single JWT role claim). */
  roles: UserRole[];
  employeeId?: string;
  // ── Fields populated in B1 / B2 — optional until then ──────────────────────
  /** Custom tenant-defined roles. Populated in B2. */
  customRoles?: string[];
  /** Fine-grained permissions. Populated in B2. */
  permissions?: string[];
  /** Department IDs the LINE_MANAGER user manages. Populated in B2. */
  managedDepartmentIds?: string[];
  /** Tenant subscription tier. Populated in B2. */
  tenantTier?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
}
```

### 5.3 `CurrentUserProvider` (hybrid upgrade)

**Props change:**

```ts
interface ProviderProps {
  children: ReactNode;
  /** Server-derived initial user — passed from root layout.tsx. Hydrates context on first paint. */
  initialUser?: CurrentUser | null;
}
```

The legacy `cookieName` prop is removed entirely. There are no callers of `CurrentUserProvider` outside `layout.tsx` — the interface change is safe. The old cookie-decode path (`decodeJwtPayload` + `readCookie`) is removed at the same time.

**Behaviour:**

1. Context is initialised from `initialUser` on first render — no flash, no client-side decode.
2. A React Query `useQuery` runs in parallel with:
   - `queryKey: ['current-user']`
   - `queryFn`: `fetch('/api/auth/me').then(r => r.json())`
   - `initialData: initialUser ?? undefined`
   - `initialDataUpdatedAt: 0`  ← treats SSR data as immediately stale; fires background refetch on mount (~100ms), not after `staleTime` expires
   - `staleTime: 60_000`
   - `refetchOnWindowFocus: true`
3. When the query resolves, context updates via `setUser(queryData)`. React Query's `initialData` prevents a loading flash — the context is never null between SSR and first fetch.

**Why `initialDataUpdatedAt: 0`:** Without it React Query treats `initialData` as fresh (timestamped at the moment of mount) and waits the full 60 seconds before the first background refetch. Setting it to `0` marks the SSR-derived data as expired-at-epoch, so the refetch fires immediately on mount and corrects any staleness from the time the server rendered the page to when the client hydrated.

**Why `initialData` not `placeholderData`:** `initialData` marks the cache as populated immediately, so `isLoading` is false from first render. `placeholderData` would cause a loading state on mount. We want the SSR user to be treated as real data that just needs background revalidation.

### 5.4 BFF `GET /api/auth/me` route (new file)

**Path:** `frontend/tenant-portal/src/app/api/auth/me/route.ts`

```
GET /api/auth/me
```

1. Reads `tenant_token` cookie from `cookies()`.
2. Returns `401` if absent.
3. Forwards to `GET ${API_GATEWAY_URL}/api/v1/auth/me` with `Authorization: Bearer <token>`.
4. On upstream 2xx: maps `UserResponse` → `CurrentUser`:
   - `userId`: `response.id`
   - `tenantId`: `response.tenantId`
   - `email`: `response.email`
   - `fullName`: `undefined` (auth-service has no name field yet)
   - `roles`: `[response.role]` — singleton array; B1 updates this to `response.roles ?? [response.role]`
   - `employeeId`: `response.employeeId ?? undefined`
5. On upstream 401/403: return 401 (token expired or revoked).
6. On other upstream errors: return 502.

No caching headers — React Query handles client-side caching via `staleTime`.

### 5.5 Tenant-portal `middleware.ts` (updated)

**Role extraction (B0 → B1 transition-ready):**

```ts
// Today (B0): JWT carries single 'role' claim
// Post-B1:    JWT carries 'roles' array — same code works, just wraps differently
const rawRole = payload.role;
const rawRoles = Array.isArray(payload.roles) ? payload.roles : (rawRole ? [rawRole] : []);
const roleSet = new Set<string>(rawRoles.filter(r => typeof r === 'string'));
```

**Header forwarding:**

`response.headers.set(...)` sets headers on the HTTP response going to the browser — those headers are NOT visible to Server Components via `await headers()`. The correct Next.js 13+ pattern is to clone the incoming request headers and pass the augmented copy through `NextResponse.next({ request: { headers: ... } })`:

```ts
// Build augmented request headers so Server Components can read them via `await headers()`
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-user-id', String(payload.sub ?? ''));
requestHeaders.set('x-user-email', String(payload.email ?? ''));
requestHeaders.set('x-tenant-id', String(payload.tenantId ?? ''));
requestHeaders.set('x-user-role', String(rawRole ?? ''));       // legacy single, backward compat
requestHeaders.set('x-user-roles', [...roleSet].join(','));     // set, B1-ready
if (payload.employeeId) requestHeaders.set('x-employee-id', String(payload.employeeId));

return NextResponse.next({ request: { headers: requestHeaders } });
```

**Path evaluation (in order):**

```
1. SUPER_ADMIN anywhere → redirect to NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? '/access-denied'
2. /admin/* and roleSet has no ADMIN_ROLES member → redirect to findCorrectDashboard(roleSet)
3. /my/*   and roleSet does not contain 'EMPLOYEE'   → redirect to findCorrectDashboard(roleSet)
4. Otherwise → allow through with augmented request headers (NextResponse.next pattern above)
```

**Logging on redirect (every redirect, info level):**

Logging must be compatible with the Edge runtime (no Node.js `winston` or `pino`). Use `console.info` with a structured object — it is available in Edge and produces structured output in Vercel/CloudWatch log aggregators:

```ts
console.info('[middleware] role-redirect', {
  userId: payload.sub,
  path: pathname,
  redirectTo,
  roles: [...roleSet],
});
```

If the project later adds an Edge-compatible logger (e.g., `@logtail/next`), replace `console.info` there. Do not import `pino` or any Node-only logger from middleware.

### 5.6 Root `layout.tsx` — server header read (updated)

```ts
import { headers } from 'next/headers';

// In the async Server Component:
const hdrs = await headers();
const role = hdrs.get('x-user-role') ?? '';
const roles = hdrs.get('x-user-roles')?.split(',').filter(Boolean) ?? (role ? [role] : []);
const initialUser: CurrentUser | null = hdrs.get('x-user-id')
  ? {
      userId: hdrs.get('x-user-id')!,
      tenantId: hdrs.get('x-tenant-id') ?? '',
      email: hdrs.get('x-user-email') ?? '',
      roles: roles as UserRole[],
      employeeId: hdrs.get('x-employee-id') ?? undefined,
    }
  : null;
```

Passes `initialUser` to `<CurrentUserProvider initialUser={initialUser}>`.

### 5.7 Login flow (updated)

**`login/route.ts` — SUPER_ADMIN rejection:**

After receiving the upstream `TokenResponse`, decode the `role` claim from the JWT payload (no verification needed — just reading the claim for the rejection check; the cookie is not set yet):

```ts
// extractRoleClaim: base64url-decode the JWT payload segment, JSON.parse, return payload.role.
// Must handle malformed JWTs defensively — if parsing throws for any reason, treat role as null
// (not as SUPER_ADMIN) so a corrupted token does not produce a false 403 rejection.
const decodedRole = extractRoleClaim(data.accessToken); // returns string | null
if (decodedRole === 'SUPER_ADMIN') {
  return NextResponse.json(
    {
      error: 'WRONG_PORTAL',
      message: 'SUPER_ADMIN accounts use the Andikisha platform portal, not the tenant portal.',
      platformPortalUrl: process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL,
    },
    { status: 403 }
  );
}
```

Cookie is never set. The JWT is never persisted. User sees the error message on the login page.

**`login/page.tsx` — role-aware redirect:**

On success, the BFF returns `{ user: UserResponse, expiresIn }`. Build the role set and call `findCorrectDashboard`:

```ts
const roles = new Set<string>(data.user?.roles ?? (data.user?.role ? [data.user.role] : []));
router.replace(findCorrectDashboard(roles));
```

`findCorrectDashboard` is imported from `@andikisha/ui`. Login page does not hardcode `/my/dashboard`.

**Login page — WRONG_PORTAL error display:**

When the server returns `403` with `error: 'WRONG_PORTAL'`, show:

> "This account uses the Andikisha platform portal. [Open platform portal →]"

The link uses `data.platformPortalUrl` if present, otherwise shows a static message without a link.

### 5.8 Platform-portal `middleware.ts` (new file)

**Path:** `frontend/platform-portal/src/middleware.ts`

Minimal guard — single concern: SUPER_ADMIN admission only.

```ts
const PUBLIC_PATHS = ['/login'];
const COOKIE_NAME = 'platform_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname) || isAsset(pathname)) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const { payload } = await jwtVerify(token, secret);

    // B0/B1 transition-ready: same set extraction as tenant-portal middleware (section 5.5)
    const rawRole = payload.role as string | undefined;
    const rawRoles = Array.isArray(payload.roles) ? payload.roles as string[] : (rawRole ? [rawRole] : []);
    const roleSet = new Set<string>(rawRoles.filter((r): r is string => typeof r === 'string'));

    if (!roleSet.has('SUPER_ADMIN')) {
      const tenantPortalUrl = process.env.NEXT_PUBLIC_TENANT_PORTAL_URL ?? '/access-denied';
      console.info('[platform-middleware] non-super-admin redirect', {
        userId: payload.sub,
        roles: [...roleSet],
        redirectTo: tenantPortalUrl,
      });
      return NextResponse.redirect(new URL(tenantPortalUrl));
    }

    // Forward headers to Server Components via request context (NOT response.headers)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(payload.sub ?? ''));
    requestHeaders.set('x-user-email', String(payload.email ?? ''));
    requestHeaders.set('x-user-role', 'SUPER_ADMIN');
    requestHeaders.set('x-user-roles', 'SUPER_ADMIN');
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}
```

Platform-portal's login route and shell wiring are Prompt A.5 work. This middleware is a safety net only.

---

## 6. Environment Variables

### `frontend/tenant-portal/.env.local.example`

```
# Existing
API_GATEWAY_URL=http://localhost:8080
JWT_SECRET=<base64-encoded-secret>
TENANT_ID=<tenant-uuid>

# New in Prompt B
NEXT_PUBLIC_PLATFORM_PORTAL_URL=http://localhost:3003
```

### `frontend/platform-portal/.env.local.example`

```
# New in Prompt B
API_GATEWAY_URL=http://localhost:8080
JWT_SECRET=<base64-encoded-secret>
NEXT_PUBLIC_TENANT_PORTAL_URL=http://localhost:3000
```

Cookie names do not require env vars — they are hardcoded constants (`tenant_token`, `platform_token`). Both portals can run on the same browser without collision.

---

## 7. Test Scope

### Tested end-to-end in this prompt

| Scenario | Expected |
|---|---|
| EMPLOYEE hits `/my/leave` | Allowed |
| EMPLOYEE hits `/admin/employees` | Redirect → `/my/dashboard` |
| ADMIN hits `/admin/dashboard` | Allowed |
| ADMIN hits `/my/dashboard` | Redirect → `/admin/dashboard` |
| LINE_MANAGER (always has EMPLOYEE) hits `/my/leave` | Allowed (set contains EMPLOYEE) |
| HR_MANAGER + EMPLOYEE (future multi-role) hits `/my/leave` | Allowed (set contains EMPLOYEE) |
| HR_MANAGER + EMPLOYEE hits `/admin/dashboard` | Allowed (set intersects ADMIN_ROLES) |
| Unauthenticated request to any protected route | Redirect → `/login` |
| SUPER_ADMIN requests any tenant-portal route (if somehow authenticated) | Redirect → `NEXT_PUBLIC_PLATFORM_PORTAL_URL` |
| Login with EMPLOYEE credentials | Redirect → `/my/dashboard` |
| Login with ADMIN credentials | Redirect → `/admin/dashboard` |
| Login with SUPER_ADMIN credentials | 403 WRONG_PORTAL, cookie never set |
| `findCorrectDashboard` unit tests — all role permutations | Correct URL for every input |
| `findCorrectDashboard` — empty roles Set (`new Set()`) | Returns `/access-denied` |
| `findCorrectDashboard` — JWT with empty `roles: []` array, no `role` claim | roleSet is empty → `/access-denied` (not a crash, not a wrong redirect) |
| `CurrentUserProvider` — initialUser hydrates on first render | No flash, role data available immediately |
| `CurrentUserProvider` — `/api/auth/me` revalidation fires within 100ms of mount | `initialDataUpdatedAt: 0` ensures React Query treats SSR data as stale; verify with `vi.useFakeTimers` that fetch is called before 100ms |
| `CurrentUserProvider` — React Query refetch on window focus | Context updates when /api/auth/me returns fresh data |
| `CurrentUserProvider` — manual role change → wait 60s or focus window | UI reflects change |
| `/api/auth/me` BFF — valid cookie | 200 with CurrentUser shape |
| `/api/auth/me` BFF — missing cookie | 401 |
| `/api/auth/me` BFF — upstream 401 (expired token) | 401 |

### Deferred to Prompt A.5 (logged, not tested here)

| Scenario | Why deferred |
|---|---|
| SUPER_ADMIN lands on tenant-portal → redirected to platform-portal origin | The redirect fires correctly in this prompt. Verifying the user lands somewhere usable in platform-portal requires A.5 shell wiring. |
| Non-SUPER_ADMIN lands on platform-portal → redirected to tenant-portal | Platform-portal middleware guard ships in this prompt but platform-portal has no running shell to receive the user. |

**Prompt A.5 acceptance criteria must include:** Cross-portal redirects verified end-to-end with both portals running.

---

## 8. Files Changed

| File | Change |
|---|---|
| `frontend/packages/ui/src/lib/auth.ts` | New — `findCorrectDashboard`, `ADMIN_ROLES`, `EMPLOYEE_ROLES` |
| `frontend/packages/ui/src/lib/useCurrentUser.tsx` | `CurrentUser` type extended; `CurrentUserProvider` hybrid upgrade; old cookie-decode path removed |
| `frontend/packages/ui/package.json` | Add `"./auth": "./src/lib/auth.ts"` subpath export for Edge runtime compatibility |
| `frontend/packages/ui/src/index.ts` | Export `findCorrectDashboard`, `ADMIN_ROLES`, `EMPLOYEE_ROLES` from `auth.ts` |
| `frontend/tenant-portal/src/middleware.ts` | Role guards, set semantics, header forwarding, redirect logging |
| `frontend/tenant-portal/src/app/api/auth/me/route.ts` | New BFF route |
| `frontend/tenant-portal/src/app/api/auth/login/route.ts` | SUPER_ADMIN rejection |
| `frontend/tenant-portal/src/app/login/page.tsx` | Role-aware redirect, WRONG_PORTAL error UI |
| `frontend/tenant-portal/src/app/layout.tsx` | Read headers, construct `initialUser`, pass to provider |
| `frontend/tenant-portal/.env.local.example` | Add `NEXT_PUBLIC_PLATFORM_PORTAL_URL` |
| `frontend/platform-portal/src/middleware.ts` | New — minimal SUPER_ADMIN guard |
| `frontend/platform-portal/.env.local.example` | New — `API_GATEWAY_URL`, `JWT_SECRET`, `NEXT_PUBLIC_TENANT_PORTAL_URL` |

---

## 9. Type Evolution Plan

| Phase | JWT shape | `/me` response | `CurrentUser.roles` source |
|---|---|---|---|
| **B0 (this prompt)** | `role: string` (single) | `role: string` | BFF wraps as `[role]` |
| **B1** | `roles: string[]` | `roles: string[]` | BFF reads array directly |
| **B2** | `roles: string[]` | `roles`, `permissions`, `managedDepartmentIds`, `tenantTier` | Provider exposes all |

No breaking change at any phase — optional fields become populated. Consumers using `useHasRole`, `useHasAnyRole`, `PermissionGate` need no updates.
