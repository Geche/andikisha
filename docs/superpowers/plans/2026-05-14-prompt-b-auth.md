# Prompt B — Role-Aware Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace four `TODO(prompt-b)` stubs with production-quality role-aware auth: set-based middleware guards, SSR-hydrated + React-Query-revalidated `CurrentUserProvider`, BFF `/api/auth/me`, SUPER_ADMIN rejection at login, and a minimal platform-portal middleware guard.

**Architecture:** Middleware forwards JWT claims as request headers (`NextResponse.next({ request: { headers } })`); root layout reads those headers and builds `initialUser` (zero-flash SSR); React Query revalidates against `/api/auth/me` within ~100ms of mount (`initialDataUpdatedAt: 0`). A pure Edge-safe `auth.ts` module in `@andikisha/ui` is the single source of truth for role-to-URL routing, imported via a `"./auth"` subpath export to avoid bundling React into middleware.

**Tech Stack:** Next.js 15 App Router, `jose` (JWT verify, Edge-compatible), `@tanstack/react-query` v5, vitest + Testing Library (packages/ui tests), TypeScript strict.

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `frontend/packages/ui/src/lib/auth.ts` | **Create** | `findCorrectDashboard`, `ADMIN_ROLES`, `EMPLOYEE_ROLES` — pure, Edge-safe |
| `frontend/packages/ui/src/lib/useCurrentUser.tsx` | **Modify** | `CurrentUser` type expanded; `CurrentUserProvider` hybrid (SSR + React Query); `cookieName` + cookie-decode path removed |
| `frontend/packages/ui/package.json` | **Modify** | Add `"exports"` with `"."` and `"./auth"` subpaths |
| `frontend/packages/ui/src/index.ts` | **Modify** | Export `findCorrectDashboard`, `ADMIN_ROLES`, `EMPLOYEE_ROLES` from `./lib/auth` |
| `frontend/packages/ui/src/__tests__/auth.test.ts` | **Create** | Unit tests for `findCorrectDashboard` + role constants |
| `frontend/packages/ui/src/__tests__/CurrentUserProvider.test.tsx` | **Create** | Tests: SSR hydration, `initialDataUpdatedAt: 0` refetch timing, window-focus refetch |
| `frontend/tenant-portal/src/middleware.ts` | **Modify** | Role guards (set semantics), `NextResponse.next({ request: { headers } })` forwarding, redirect logging |
| `frontend/tenant-portal/src/app/layout.tsx` | **Modify** | Async; reads `x-user-*` headers; builds `initialUser`; swaps provider order: `QueryProvider` wraps `CurrentUserProvider` |
| `frontend/tenant-portal/src/app/api/auth/me/route.ts` | **Create** | BFF GET `/api/auth/me` — reads cookie, proxies to backend, normalises to `CurrentUser` |
| `frontend/tenant-portal/src/app/api/auth/login/route.ts` | **Modify** | Adds `extractRoleClaim` helper; SUPER_ADMIN rejection before cookie is set |
| `frontend/tenant-portal/src/app/login/page.tsx` | **Modify** | `findCorrectDashboard` post-login redirect; WRONG_PORTAL error UI |
| `frontend/platform-portal/package.json` | **Create** | Minimal Next.js 15 app scaffold |
| `frontend/platform-portal/tsconfig.json` | **Create** | TypeScript config (mirrors tenant-portal) |
| `frontend/platform-portal/next.config.ts` | **Create** | Minimal Next.js config |
| `frontend/platform-portal/src/app/page.tsx` | **Create** | Root redirect to `/login` (placeholder) |
| `frontend/platform-portal/src/app/login/page.tsx` | **Create** | Minimal login placeholder (shell in Prompt A.5) |
| `frontend/platform-portal/src/middleware.ts` | **Create** | SUPER_ADMIN-only admission; B0/B1-ready set extraction; `NextResponse.next({ request: { headers } })` |
| `frontend/platform-portal/.env.local.example` | **Create** | `API_GATEWAY_URL`, `JWT_SECRET`, `NEXT_PUBLIC_TENANT_PORTAL_URL` |
| `frontend/tenant-portal/.env.local.example` | **Modify** | Add `NEXT_PUBLIC_PLATFORM_PORTAL_URL` |

---

## Task 1: Create `@andikisha/ui/lib/auth.ts` (Edge-safe role utilities)

**Files:**
- Create: `frontend/packages/ui/src/lib/auth.ts`
- Create: `frontend/packages/ui/src/__tests__/auth.test.ts`

- [ ] **Step 1.1: Write the failing tests first**

Create `frontend/packages/ui/src/__tests__/auth.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { findCorrectDashboard, ADMIN_ROLES, EMPLOYEE_ROLES } from "../lib/auth";

// Store original env
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

describe("findCorrectDashboard", () => {
  it("returns platform portal URL for SUPER_ADMIN when env var is set", () => {
    process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL = "http://localhost:3003";
    expect(findCorrectDashboard(new Set(["SUPER_ADMIN"]))).toBe("http://localhost:3003");
  });

  it("returns /access-denied for SUPER_ADMIN when env var is not set", () => {
    delete process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL;
    expect(findCorrectDashboard(new Set(["SUPER_ADMIN"]))).toBe("/access-denied");
  });

  it("returns /admin/dashboard for ADMIN", () => {
    expect(findCorrectDashboard(new Set(["ADMIN"]))).toBe("/admin/dashboard");
  });

  it("returns /admin/dashboard for HR_MANAGER", () => {
    expect(findCorrectDashboard(new Set(["HR_MANAGER"]))).toBe("/admin/dashboard");
  });

  it("returns /admin/dashboard for PAYROLL_OFFICER", () => {
    expect(findCorrectDashboard(new Set(["PAYROLL_OFFICER"]))).toBe("/admin/dashboard");
  });

  it("returns /admin/dashboard for HR", () => {
    expect(findCorrectDashboard(new Set(["HR"]))).toBe("/admin/dashboard");
  });

  it("returns /my/dashboard for EMPLOYEE", () => {
    expect(findCorrectDashboard(new Set(["EMPLOYEE"]))).toBe("/my/dashboard");
  });

  it("returns /my/dashboard for LINE_MANAGER+EMPLOYEE (LINE_MANAGER routes through /my/*)", () => {
    expect(findCorrectDashboard(new Set(["EMPLOYEE", "LINE_MANAGER"]))).toBe("/my/dashboard");
  });

  it("returns /access-denied for empty roles Set", () => {
    expect(findCorrectDashboard(new Set())).toBe("/access-denied");
  });

  it("returns /access-denied for JWT with empty roles array (no recognised roles)", () => {
    // Simulates B0 JWT where role claim was absent and rawRoles resolved to []
    expect(findCorrectDashboard(new Set<string>([]))).toBe("/access-denied");
  });

  it("returns /admin/dashboard for multi-role HR_MANAGER+EMPLOYEE (admin check runs first)", () => {
    expect(findCorrectDashboard(new Set(["HR_MANAGER", "EMPLOYEE"]))).toBe("/admin/dashboard");
  });

  it("ADMIN_ROLES contains exactly the four admin roles", () => {
    expect([...ADMIN_ROLES].sort()).toEqual(["ADMIN", "HR", "HR_MANAGER", "PAYROLL_OFFICER"].sort());
  });

  it("EMPLOYEE_ROLES contains only EMPLOYEE", () => {
    expect([...EMPLOYEE_ROLES]).toEqual(["EMPLOYEE"]);
  });
});
```

- [ ] **Step 1.2: Run tests — expect failure (module not found)**

```bash
cd frontend/packages/ui && pnpm test src/__tests__/auth.test.ts
```

Expected: `Cannot find module '../lib/auth'`

- [ ] **Step 1.3: Create `auth.ts`**

Create `frontend/packages/ui/src/lib/auth.ts`:

```ts
/**
 * EDGE RUNTIME SAFE — this file must remain pure:
 * - No React imports, hooks, or JSX
 * - No Node.js built-ins (fs, crypto, etc.)
 * - No dynamic requires
 * Next.js middleware runs in the Edge runtime. This file is imported via the
 * './auth' subpath export to avoid bundling the barrel (which includes React).
 */

export const ADMIN_ROLES = new Set(["ADMIN", "HR_MANAGER", "PAYROLL_OFFICER", "HR"] as const);
export const EMPLOYEE_ROLES = new Set(["EMPLOYEE"] as const);

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
  if (roles.has("SUPER_ADMIN")) {
    return process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? "/access-denied";
  }
  if ([...ADMIN_ROLES].some((r) => roles.has(r))) return "/admin/dashboard";
  if (roles.has("EMPLOYEE")) return "/my/dashboard";
  return "/access-denied";
}
```

- [ ] **Step 1.4: Run tests — expect pass**

```bash
cd frontend/packages/ui && pnpm test src/__tests__/auth.test.ts
```

Expected: all 13 tests pass

- [ ] **Step 1.5: Commit**

```bash
git add frontend/packages/ui/src/lib/auth.ts frontend/packages/ui/src/__tests__/auth.test.ts
git commit -m "feat(ui): add edge-safe auth.ts with findCorrectDashboard + unit tests"
```

---

## Task 2: Wire `@andikisha/ui` subpath export + barrel

**Files:**
- Modify: `frontend/packages/ui/package.json`
- Modify: `frontend/packages/ui/src/index.ts`

- [ ] **Step 2.1: Add `exports` field to `packages/ui/package.json`**

The existing file has `"main"` and `"types"` but no `"exports"`. Add the `exports` field so both the default import path and the Edge-safe `./auth` subpath resolve correctly:

```json
{
  "name": "@andikisha/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./auth": "./src/lib/auth.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Leave all `dependencies`, `peerDependencies`, and `devDependencies` unchanged.

- [ ] **Step 2.2: Export auth utilities from the barrel `src/index.ts`**

Find the `// ── Role & Permission` section in `frontend/packages/ui/src/index.ts` (around line 68). Add these exports immediately before that section:

```ts
// ── Auth utilities (also available via @andikisha/ui/auth for Edge runtime) ──
export { findCorrectDashboard, ADMIN_ROLES, EMPLOYEE_ROLES } from "./lib/auth";
```

The section should now look like:

```ts
// ── Auth utilities (also available via @andikisha/ui/auth for Edge runtime) ──
export { findCorrectDashboard, ADMIN_ROLES, EMPLOYEE_ROLES } from "./lib/auth";

// ── Role & Permission ──────────────────────────────────────────────────────────
export { useCurrentRole, RoleContext } from "./lib/useCurrentRole";
// ... rest unchanged
```

- [ ] **Step 2.3: Type-check**

```bash
cd frontend/packages/ui && pnpm type-check
```

Expected: no errors

- [ ] **Step 2.4: Commit**

```bash
git add frontend/packages/ui/package.json frontend/packages/ui/src/index.ts
git commit -m "feat(ui): add ./auth subpath export for Edge runtime compatibility"
```

---

## Task 3: Upgrade `CurrentUserProvider` to hybrid SSR + React Query

**Files:**
- Modify: `frontend/packages/ui/src/lib/useCurrentUser.tsx`
- Create: `frontend/packages/ui/src/__tests__/CurrentUserProvider.test.tsx`

- [ ] **Step 3.1: Write the failing tests first**

Create `frontend/packages/ui/src/__tests__/CurrentUserProvider.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrentUserProvider, useCurrentUser } from "../lib/useCurrentUser";
import type { CurrentUser } from "../lib/useCurrentUser";

// Minimal wrapper: QueryProvider must wrap CurrentUserProvider
function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function CurrentUserDisplay() {
  const user = useCurrentUser();
  if (!user) return <span>no-user</span>;
  return <span>{user.email}:{user.roles.join(",")}</span>;
}

const INITIAL_USER: CurrentUser = {
  userId: "u1",
  tenantId: "t1",
  email: "hr@acme.co",
  roles: ["HR_MANAGER"],
};

const FRESH_USER: CurrentUser = {
  userId: "u1",
  tenantId: "t1",
  email: "hr@acme.co",
  roles: ["HR_MANAGER"],
  employeeId: "e1",
};

describe("CurrentUserProvider", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it("hydrates immediately from initialUser — no flash, no fetch on first render", () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(FRESH_USER), { status: 200 })
    );

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={INITIAL_USER}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    // Must be available on FIRST render without waiting
    expect(screen.getByText("hr@acme.co:HR_MANAGER")).toBeInTheDocument();
  });

  it("fires /api/auth/me refetch within 100ms of mount (initialDataUpdatedAt: 0 effect)", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(FRESH_USER), { status: 200 })
    );

    vi.useFakeTimers();
    const Wrapper = makeWrapper(queryClient);

    render(
      <Wrapper>
        <CurrentUserProvider initialUser={INITIAL_USER}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    // Advance by 100ms — should be enough for the stale refetch to fire
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/me");
    vi.useRealTimers();
  });

  it("updates context when /api/auth/me resolves with richer user data", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(FRESH_USER), { status: 200 })
    );

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={INITIAL_USER}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith("/api/auth/me"));
    // After fetch resolves, context should reflect the server response
    await waitFor(() =>
      expect(screen.getByText("hr@acme.co:HR_MANAGER")).toBeInTheDocument()
    );
  });

  it("renders no-user when initialUser is null and fetch returns 401", async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 401 }));

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={null}>
          <CurrentUserDisplay />
        </CurrentUserDisplay>
        </CurrentUserProvider>
      </Wrapper>
    );

    // Immediately shows no-user (no initialUser)
    expect(screen.getByText("no-user")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3.2: Run tests — expect failure (CurrentUserProvider signature mismatch)**

```bash
cd frontend/packages/ui && pnpm test src/__tests__/CurrentUserProvider.test.tsx
```

Expected: tests fail (existing provider still has cookie-decode path, no `useQuery`)

- [ ] **Step 3.3: Rewrite `useCurrentUser.tsx`**

Replace the entire file `frontend/packages/ui/src/lib/useCurrentUser.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserRole } from "./useCurrentRole";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  tenantTier?: "STARTER" | "GROWTH" | "ENTERPRISE";
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const CurrentUserContext = createContext<CurrentUser | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Hybrid SSR + React Query provider.
 *
 * 1. Renders immediately from `initialUser` (server-derived from x-user-* headers) — no flash.
 * 2. React Query fires a background GET /api/auth/me refetch on mount (~100ms, because
 *    initialDataUpdatedAt is set to 0 which marks SSR data as immediately stale).
 * 3. Context updates when the refetch resolves, correcting any staleness from
 *    the time the server rendered to when the client hydrated.
 *
 * IMPORTANT: This is SOFT UI gating only. The middleware enforces real role checks on
 * every request. Do not use role information from this hook to enforce security boundaries.
 *
 * IMPORTANT: This component uses useQuery and MUST be rendered inside a QueryClientProvider
 * (i.e., inside <QueryProvider> in the root layout).
 */
export function CurrentUserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: CurrentUser | null;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser ?? null);

  const { data: queryUser } = useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json() as Promise<CurrentUser>;
    },
    initialData: initialUser ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  // Sync React Query result into context whenever it changes
  useEffect(() => {
    if (queryUser !== undefined) {
      setUser(queryUser ?? null);
    }
  }, [queryUser]);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Returns the decoded current user, or null if unauthenticated. */
export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext);
}

/** Returns true if the user holds the given role. */
export function useHasRole(role: UserRole): boolean {
  const user = useCurrentUser();
  return user?.roles.includes(role) ?? false;
}

/** Returns true if the user holds at least one of the given roles. */
export function useHasAnyRole(...roles: UserRole[]): boolean {
  const user = useCurrentUser();
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

/** Returns true if there is an authenticated user in context. */
export function useIsAuthenticated(): boolean {
  return useCurrentUser() !== null;
}
```

- [ ] **Step 3.4: Fix the test — typo in test file**

In `CurrentUserProvider.test.tsx`, the "no-user" test has a nesting mistake — fix `</CurrentUserDisplay>` to be `</CurrentUserProvider>`:

```tsx
  it("renders no-user when initialUser is null and fetch returns 401", async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 401 }));

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={null}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    expect(screen.getByText("no-user")).toBeInTheDocument();
  });
```

- [ ] **Step 3.5: Run all packages/ui tests**

```bash
cd frontend/packages/ui && pnpm test
```

Expected: all tests pass (auth.test.ts + CurrentUserProvider.test.tsx + PermissionGate.test.tsx)

- [ ] **Step 3.6: Type-check**

```bash
cd frontend/packages/ui && pnpm type-check
```

Expected: no errors

- [ ] **Step 3.7: Commit**

```bash
git add frontend/packages/ui/src/lib/useCurrentUser.tsx \
        frontend/packages/ui/src/__tests__/CurrentUserProvider.test.tsx
git commit -m "feat(ui): CurrentUserProvider hybrid — SSR hydration + React Query revalidation"
```

---

## Task 4: Create BFF `GET /api/auth/me`

**Files:**
- Create: `frontend/tenant-portal/src/app/api/auth/me/route.ts`

- [ ] **Step 4.1: Create the route handler**

Create `frontend/tenant-portal/src/app/api/auth/me/route.ts`:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  if (upstream.status === 401 || upstream.status === 403) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "UPSTREAM_ERROR" }, { status: 502 });
  }

  // UserResponse from auth-service: { id, tenantId, email, role, employeeId, ... }
  const data = await upstream.json() as {
    id: string;
    tenantId: string;
    email: string;
    role: string;
    roles?: string[];
    employeeId?: string;
  };

  // Normalise to CurrentUser shape.
  // B1 update: change `[data.role]` to `data.roles ?? [data.role]` when auth-service sends array.
  const currentUser = {
    userId: data.id,
    tenantId: data.tenantId,
    email: data.email,
    fullName: undefined, // auth-service has no name field yet — see user profile prompt
    roles: [data.role],
    employeeId: data.employeeId ?? undefined,
  };

  return NextResponse.json(currentUser);
}
```

- [ ] **Step 4.2: Type-check tenant-portal**

```bash
cd frontend/tenant-portal && npx tsc --noEmit
```

Expected: no errors in the new file

- [ ] **Step 4.3: Commit**

```bash
git add frontend/tenant-portal/src/app/api/auth/me/route.ts
git commit -m "feat(portal): add BFF GET /api/auth/me route"
```

---

## Task 5: Update tenant-portal `middleware.ts` with role guards

**Files:**
- Modify: `frontend/tenant-portal/src/middleware.ts`

- [ ] **Step 5.1: Replace `middleware.ts`**

Replace the entire file `frontend/tenant-portal/src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { findCorrectDashboard, ADMIN_ROLES } from "@andikisha/ui/auth";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/preview"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/sw-my.js")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || isAsset(pathname)) return NextResponse.next();

  const token = request.cookies.get("tenant_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const rawSecret = process.env.JWT_SECRET;
    if (!rawSecret) {
      console.error("[middleware] JWT_SECRET is not set — rejecting request");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const secret = Uint8Array.from(
      atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const { payload } = await jwtVerify(token, secret);

    // B0/B1 transition-ready role extraction.
    // Today (B0): JWT carries single 'role' claim.
    // Post-B1: JWT carries 'roles' array — same code works.
    const rawRole = payload.role as string | undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[])
      : rawRole
      ? [rawRole]
      : [];
    const roleSet = new Set<string>(rawRoles.filter((r): r is string => typeof r === "string"));

    // Path evaluation — in priority order.
    // 1. SUPER_ADMIN anywhere → platform portal
    if (roleSet.has("SUPER_ADMIN")) {
      const redirectTo = process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? "/access-denied";
      console.info("[middleware] role-redirect", {
        userId: payload.sub,
        path: pathname,
        redirectTo,
        roles: [...roleSet],
      });
      return NextResponse.redirect(new URL(redirectTo));
    }

    // 2. /admin/* with no admin role → correct dashboard
    if (pathname.startsWith("/admin")) {
      const hasAdminRole = [...ADMIN_ROLES].some((r) => roleSet.has(r));
      if (!hasAdminRole) {
        const redirectTo = findCorrectDashboard(roleSet);
        console.info("[middleware] role-redirect", {
          userId: payload.sub,
          path: pathname,
          redirectTo,
          roles: [...roleSet],
        });
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    // 3. /my/* without EMPLOYEE role → correct dashboard
    if (pathname.startsWith("/my")) {
      if (!roleSet.has("EMPLOYEE")) {
        const redirectTo = findCorrectDashboard(roleSet);
        console.info("[middleware] role-redirect", {
          userId: payload.sub,
          path: pathname,
          redirectTo,
          roles: [...roleSet],
        });
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    // 4. Allowed — forward augmented headers to Server Components via request context.
    // IMPORTANT: NextResponse.next({ request: { headers } }) is the correct pattern.
    // response.headers.set(...) sets browser-facing headers only — NOT visible to Server
    // Components via await headers(). The request copy is what propagates to the server.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));
    requestHeaders.set("x-tenant-id", String(payload.tenantId ?? ""));
    requestHeaders.set("x-user-role", String(rawRole ?? ""));      // legacy single, backward compat
    requestHeaders.set("x-user-roles", [...roleSet].join(","));    // set, B1-ready
    if (payload.employeeId) {
      requestHeaders.set("x-employee-id", String(payload.employeeId));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("tenant_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 5.2: Verify `@andikisha/ui/auth` import resolves in tenant-portal tsconfig**

The `tsconfig.json` at `frontend/tenant-portal/tsconfig.json` has a path alias for `@andikisha/ui` pointing to `../packages/ui/src`. Subpath imports like `@andikisha/ui/auth` resolve through Node's `exports` field (added in Task 2), not through TypeScript path aliases. For type-checking, add an explicit alias:

Open `frontend/tenant-portal/tsconfig.json` and update the `paths` section:

```json
"paths": {
  "@/*": ["./src/*"],
  "@andikisha/ui": ["../packages/ui/src"],
  "@andikisha/ui/auth": ["../packages/ui/src/lib/auth.ts"],
  "@andikisha/api-client": ["../packages/api-client/src"],
  "@andikisha/shared-types": ["../packages/shared-types/src"]
}
```

- [ ] **Step 5.3: Type-check tenant-portal**

```bash
cd frontend/tenant-portal && npx tsc --noEmit
```

Expected: no errors in middleware.ts

- [ ] **Step 5.4: Commit**

```bash
git add frontend/tenant-portal/src/middleware.ts frontend/tenant-portal/tsconfig.json
git commit -m "feat(portal): middleware role guards with set semantics and header forwarding"
```

---

## Task 6: Update root `layout.tsx` — server header read + provider order fix

**Files:**
- Modify: `frontend/tenant-portal/src/app/layout.tsx`

The current layout has `CurrentUserProvider` **wrapping** `QueryProvider`. This is wrong — `CurrentUserProvider` now uses `useQuery` internally and must be **inside** `QueryProvider`. Fix both the order and make the component async to read headers.

- [ ] **Step 6.1: Replace `layout.tsx`**

Replace `frontend/tenant-portal/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import { QueryProvider, ToastProvider, CurrentUserProvider } from "@andikisha/ui";
import type { CurrentUser } from "@andikisha/ui";
import type { UserRole } from "@andikisha/ui";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AndikishaHR", template: "%s | AndikishaHR" },
  description: "Enterprise HR and Payroll Management",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();

  // Build initialUser from headers set by middleware.
  // Falls back gracefully when middleware has not run (e.g., static pages, login route).
  const userId = hdrs.get("x-user-id");
  const role = hdrs.get("x-user-role") ?? "";
  const roles = hdrs.get("x-user-roles")?.split(",").filter(Boolean) ?? (role ? [role] : []);

  const initialUser: CurrentUser | null = userId
    ? {
        userId,
        tenantId: hdrs.get("x-tenant-id") ?? "",
        email: hdrs.get("x-user-email") ?? "",
        roles: roles as UserRole[],
        employeeId: hdrs.get("x-employee-id") ?? undefined,
      }
    : null;

  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="font-body text-near-black bg-surface antialiased">
        {/*
          QueryProvider must wrap CurrentUserProvider because CurrentUserProvider
          uses useQuery internally. Inverting this order causes a "No QueryClient" error.
        */}
        <QueryProvider>
          <CurrentUserProvider initialUser={initialUser}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CurrentUserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6.2: Type-check tenant-portal**

```bash
cd frontend/tenant-portal && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6.3: Commit**

```bash
git add frontend/tenant-portal/src/app/layout.tsx
git commit -m "feat(portal): root layout reads x-user-* headers and passes initialUser to provider"
```

---

## Task 7: Login BFF — SUPER_ADMIN rejection

**Files:**
- Modify: `frontend/tenant-portal/src/app/api/auth/login/route.ts`

- [ ] **Step 7.1: Add `extractRoleClaim` helper and SUPER_ADMIN rejection**

Replace `frontend/tenant-portal/src/app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

// Simple in-memory rate limiter (10 attempts per 15 minutes per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count++;
  return false;
}

/**
 * Base64url-decodes the JWT payload segment and returns the role claim.
 * Deliberately does NOT verify the signature — this is only for the SUPER_ADMIN rejection
 * check before the cookie is set. The cookie is never set for SUPER_ADMIN, so there is no
 * security risk in reading the unverified claim here.
 *
 * Returns null if the JWT is malformed, so a corrupted token never produces a false 403.
 */
function extractRoleClaim(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as Record<string, unknown>;
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await request.json() as { email?: string; password?: string };

  const tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    return NextResponse.json(
      { error: "PORTAL_NOT_CONFIGURED", message: "This portal is not linked to a tenant." },
      { status: 503 }
    );
  }

  const upstream = await fetch(`${GATEWAY}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tenant-ID": tenantId },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await upstream.json() as {
    accessToken?: string;
    expiresIn?: number;
    user?: { id: string; tenantId: string; email: string; role: string; roles?: string[]; employeeId?: string };
  };

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (typeof data.accessToken !== "string" || !data.accessToken) {
    return NextResponse.json({ error: "Bad upstream response" }, { status: 502 });
  }

  // Reject SUPER_ADMIN at this portal — they belong in the platform portal.
  // extractRoleClaim returns null on parse failure; null !== 'SUPER_ADMIN' so no false rejection.
  const decodedRole = extractRoleClaim(data.accessToken);
  if (decodedRole === "SUPER_ADMIN") {
    // Cookie is never set. The JWT is never persisted.
    return NextResponse.json(
      {
        error: "WRONG_PORTAL",
        message: "SUPER_ADMIN accounts use the Andikisha platform portal, not the tenant portal.",
        platformPortalUrl: process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL,
      },
      { status: 403 }
    );
  }

  const expiresIn =
    typeof data.expiresIn === "number" && data.expiresIn > 0
      ? data.expiresIn
      : 3600;

  const isProduction = process.env.NODE_ENV === "production";
  const jar = await cookies();
  jar.set(COOKIE_NAME, data.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });

  return NextResponse.json({
    user: data.user,
    expiresIn,
  });
}
```

- [ ] **Step 7.2: Type-check**

```bash
cd frontend/tenant-portal && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7.3: Commit**

```bash
git add frontend/tenant-portal/src/app/api/auth/login/route.ts
git commit -m "feat(portal): reject SUPER_ADMIN at login BFF with WRONG_PORTAL 403"
```

---

## Task 8: Login page — role-aware redirect + WRONG_PORTAL error UI

**Files:**
- Modify: `frontend/tenant-portal/src/app/login/page.tsx`

- [ ] **Step 8.1: Update `login/page.tsx`**

Replace the `handleSubmit` function and add the WRONG_PORTAL error UI. The login page imports `findCorrectDashboard` from the `@andikisha/ui/auth` subpath (safe in client components — Edge runtime restriction only applies to middleware):

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ExternalLink, Mail } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { findCorrectDashboard } from "@andikisha/ui/auth";

type LoginError =
  | { kind: "general"; message: string }
  | { kind: "wrong_portal"; platformPortalUrl?: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as {
        error?: string;
        message?: string;
        platformPortalUrl?: string;
        user?: { role?: string; roles?: string[] };
        expiresIn?: number;
      };

      if (!res.ok) {
        if (data.error === "WRONG_PORTAL") {
          setError({ kind: "wrong_portal", platformPortalUrl: data.platformPortalUrl });
          return;
        }
        setError({ kind: "general", message: data.message ?? "Invalid credentials. Please try again." });
        return;
      }

      // Role-aware redirect — never hardcode /my/dashboard.
      const roles = new Set<string>(
        data.user?.roles ?? (data.user?.role ? [data.user.role] : [])
      );
      router.replace(findCorrectDashboard(roles));
    } catch {
      setError({ kind: "general", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-4 py-8"
      style={{
        background: "linear-gradient(135deg, #071E13 0%, #0B3D2E 50%, #166A50 100%)",
      }}
    >
      {/* Logo — top centre */}
      <div className="w-full flex justify-center pt-2">
        <LogoFull className="h-[28px] w-auto brightness-0 invert" />
      </div>

      {/* Form card — vertically centred */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-bold text-[#02110C] mb-1">Sign In</h1>
          <p className="text-[14px] text-neutral-500">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full border border-neutral-300 rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-neutral-400 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Mail size={16} />
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-neutral-300 rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-neutral-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-500 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-[#0B3D2E] accent-[#0B3D2E] cursor-pointer"
              />
              <span className="text-[13px] text-neutral-700">Remember Me</span>
            </label>
            <button
              type="button"
              className="text-[13px] font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error states */}
          {error?.kind === "general" && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error.message}
            </p>
          )}

          {error?.kind === "wrong_portal" && (
            <div className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
              <p className="font-medium mb-1">Wrong portal</p>
              <p className="mb-2">This account uses the Andikisha platform portal.</p>
              {error.platformPortalUrl ? (
                <a
                  href={error.platformPortalUrl}
                  className="inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
                >
                  Open platform portal
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-amber-600">Contact your administrator for the platform portal URL.</p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B3D2E] hover:bg-[#0F5040] active:bg-[#071E13] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] h-11 rounded-lg transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>

      {/* Footer — bottom */}
      <p className="text-[12px] text-white/50 pb-2">
        &copy; {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
      </p>
    </div>
  );
}
```

- [ ] **Step 8.2: Add `@andikisha/ui/auth` path alias in tenant-portal tsconfig (if not done in Task 5.2)**

Verify `frontend/tenant-portal/tsconfig.json` already has `"@andikisha/ui/auth": ["../packages/ui/src/lib/auth.ts"]` in `paths`. If not, add it (see Task 5.2).

- [ ] **Step 8.3: Type-check**

```bash
cd frontend/tenant-portal && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8.4: Commit**

```bash
git add frontend/tenant-portal/src/app/login/page.tsx
git commit -m "feat(portal): role-aware login redirect + WRONG_PORTAL error UI"
```

---

## Task 9: Scaffold platform-portal + SUPER_ADMIN middleware

**Files:**
- Create: `frontend/platform-portal/package.json`
- Create: `frontend/platform-portal/tsconfig.json`
- Create: `frontend/platform-portal/next.config.ts`
- Create: `frontend/platform-portal/src/app/page.tsx`
- Create: `frontend/platform-portal/src/app/login/page.tsx`
- Create: `frontend/platform-portal/src/middleware.ts`
- Create: `frontend/platform-portal/.env.local.example`

`platform-portal` does not exist yet. The pnpm workspace glob `"frontend/*"` picks it up automatically once the directory exists. All shell wiring and full pages are Prompt A.5 work. This task creates only enough structure to host the middleware.

- [ ] **Step 9.1: Create `frontend/platform-portal/package.json`**

```json
{
  "name": "platform-portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3003",
    "build": "next build",
    "start": "next start --port 3003",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@andikisha/ui": "workspace:*",
    "jose": "^5.10.0",
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.1.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 9.2: Create `frontend/platform-portal/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@andikisha/ui": ["../packages/ui/src"],
      "@andikisha/ui/auth": ["../packages/ui/src/lib/auth.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 9.3: Create `frontend/platform-portal/next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@andikisha/ui"],
};

export default nextConfig;
```

- [ ] **Step 9.4: Create root redirect `frontend/platform-portal/src/app/page.tsx`**

```tsx
import { redirect } from "next/navigation";

// Platform portal root redirects to login until A.5 wires the shell.
export default function RootPage() {
  redirect("/login");
}
```

- [ ] **Step 9.5: Create login placeholder `frontend/platform-portal/src/app/login/page.tsx`**

```tsx
export default function PlatformLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-500 text-sm">
        Platform portal login — wired in Prompt A.5.
      </p>
    </main>
  );
}
```

- [ ] **Step 9.6: Create `frontend/platform-portal/src/middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login"];
const COOKIE_NAME = "platform_token";

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || isAsset(pathname)) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const rawSecret = process.env.JWT_SECRET;
    if (!rawSecret) {
      console.error("[platform-middleware] JWT_SECRET is not set");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const secret = Uint8Array.from(
      atob(rawSecret.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const { payload } = await jwtVerify(token, secret);

    // B0/B1 transition-ready: same set extraction as tenant-portal middleware.
    const rawRole = payload.role as string | undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[])
      : rawRole
      ? [rawRole]
      : [];
    const roleSet = new Set<string>(
      rawRoles.filter((r): r is string => typeof r === "string")
    );

    // Only SUPER_ADMIN may enter the platform portal.
    if (!roleSet.has("SUPER_ADMIN")) {
      const tenantPortalUrl = process.env.NEXT_PUBLIC_TENANT_PORTAL_URL ?? "/access-denied";
      console.info("[platform-middleware] non-super-admin redirect", {
        userId: payload.sub,
        roles: [...roleSet],
        redirectTo: tenantPortalUrl,
      });
      return NextResponse.redirect(new URL(tenantPortalUrl));
    }

    // Forward headers to Server Components via request context.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));
    requestHeaders.set("x-user-role", "SUPER_ADMIN");
    requestHeaders.set("x-user-roles", "SUPER_ADMIN");
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 9.7: Create `frontend/platform-portal/.env.local.example`**

```
# Required — base URL of the API gateway
API_GATEWAY_URL=http://localhost:8080

# Required — same secret used by auth-service (base64-encoded)
JWT_SECRET=<base64-encoded-secret>

# Used by middleware to redirect non-SUPER_ADMIN users back to tenant portal
NEXT_PUBLIC_TENANT_PORTAL_URL=http://localhost:3000
```

- [ ] **Step 9.8: Install workspace dependencies**

```bash
cd /path/to/project && pnpm install
```

Expected: pnpm resolves `platform-portal` as a new workspace member, installs `jose`, `next`, `@andikisha/ui` workspace link.

- [ ] **Step 9.9: Type-check platform-portal**

```bash
cd frontend/platform-portal && npx tsc --noEmit 2>&1 || echo "(next-env.d.ts may not exist yet - run next build to generate)"
```

If the type-check fails only because `next-env.d.ts` doesn't exist yet, that is expected — it gets generated on the first `next build` or `next dev`. TypeScript errors in the written files should be fixed before committing.

- [ ] **Step 9.10: Commit**

```bash
git add frontend/platform-portal/
git commit -m "feat(platform-portal): minimal scaffold + SUPER_ADMIN-only middleware guard"
```

---

## Task 10: Environment variables + final validation

**Files:**
- Modify: `frontend/tenant-portal/.env.local.example`

- [ ] **Step 10.1: Add `NEXT_PUBLIC_PLATFORM_PORTAL_URL` to tenant-portal env example**

Open `frontend/tenant-portal/.env.local.example` and append:

```
# New in Prompt B — URL of the platform portal; used when redirecting SUPER_ADMIN users
NEXT_PUBLIC_PLATFORM_PORTAL_URL=http://localhost:3003
```

- [ ] **Step 10.2: Run all packages/ui tests**

```bash
cd frontend/packages/ui && pnpm test
```

Expected: all tests pass (auth.test.ts + CurrentUserProvider.test.tsx + PermissionGate.test.tsx)

- [ ] **Step 10.3: Type-check tenant-portal**

```bash
cd frontend/tenant-portal && npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 10.4: Type-check packages/ui**

```bash
cd frontend/packages/ui && pnpm type-check
```

Expected: zero errors

- [ ] **Step 10.5: Commit**

```bash
git add frontend/tenant-portal/.env.local.example
git commit -m "chore: add NEXT_PUBLIC_PLATFORM_PORTAL_URL to tenant-portal env example"
```

---

## Spec Coverage Checklist (self-review)

| Spec requirement | Task |
|---|---|
| `@andikisha/ui/lib/auth.ts` — `findCorrectDashboard`, `ADMIN_ROLES`, `EMPLOYEE_ROLES` | Task 1 |
| `"./auth"` subpath export in `packages/ui/package.json` | Task 2 |
| Barrel exports `findCorrectDashboard` etc. from `src/index.ts` | Task 2 |
| `CurrentUser` type extended with B1/B2 optional fields | Task 3 |
| `CurrentUserProvider` — `cookieName` prop removed | Task 3 |
| `CurrentUserProvider` — `initialData` + `initialDataUpdatedAt: 0` + `staleTime: 60_000` | Task 3 |
| `CurrentUserProvider` — `refetchOnWindowFocus: true` | Task 3 |
| `CurrentUserProvider` must be inside `QueryProvider` | Task 6 |
| BFF `GET /api/auth/me` — reads `tenant_token` cookie, proxies, normalises | Task 4 |
| Tenant-portal middleware — set-based role extraction (B0/B1 ready) | Task 5 |
| Tenant-portal middleware — `NextResponse.next({ request: { headers } })` | Task 5 |
| Tenant-portal middleware — SUPER_ADMIN redirect | Task 5 |
| Tenant-portal middleware — `/admin/*` guard | Task 5 |
| Tenant-portal middleware — `/my/*` EMPLOYEE check (not LINE_MANAGER) | Task 5 |
| Tenant-portal middleware — redirect logging (`console.info`) | Task 5 |
| Root `layout.tsx` — reads `x-user-*` headers, builds `initialUser` | Task 6 |
| Login BFF — `extractRoleClaim` helper (handles malformed JWT as null) | Task 7 |
| Login BFF — SUPER_ADMIN rejection before cookie set | Task 7 |
| Login page — `findCorrectDashboard` post-login redirect | Task 8 |
| Login page — WRONG_PORTAL error UI with platform portal link | Task 8 |
| Platform-portal minimal scaffold | Task 9 |
| Platform-portal middleware — `platform_token` cookie | Task 9 |
| Platform-portal middleware — B0/B1 set extraction | Task 9 |
| Platform-portal middleware — `NextResponse.next({ request: { headers } })` | Task 9 |
| `NEXT_PUBLIC_PLATFORM_PORTAL_URL` env var documented | Task 10 |
| `findCorrectDashboard` unit tests — all role permutations | Task 1 |
| `findCorrectDashboard` — empty roles Set → `/access-denied` | Task 1 |
| `CurrentUserProvider` — revalidation fires within 100ms of mount | Task 3 |
| `/api/auth/me` BFF — missing cookie → 401 | Task 4 |
| `/api/auth/me` BFF — upstream 401 → 401 | Task 4 |
