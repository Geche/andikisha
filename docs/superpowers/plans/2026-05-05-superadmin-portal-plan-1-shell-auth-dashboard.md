# Superadmin Portal — Plan 1: Shell, Auth & Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated shell (sidebar, layout, login) and the dashboard page with metric cards, tenant growth chart, and tenant table — fully wired to the API gateway.

**Architecture:** Next.js 15 App Router with a protected `(dashboard)` route group. A shared `Sidebar` server component renders navigation. All API calls go through a typed `apiClient` (Axios + Zod) that reads `superadmin_token` from cookies and attaches `Authorization: Bearer`. The dashboard page uses TanStack Query for client-side data fetching with skeleton loaders. Three new auth-service endpoints (sessions list, revoke, rotate-secret) are added on the backend.

**Tech Stack:** Next.js 15, React 19, TanStack Query 5, Axios, Zod, Tailwind CSS (brand tokens already configured), lucide-react (icon set), Java 21, Spring Boot 3.4 (auth-service)

---

## File Map

### Frontend — new files
```
frontend/superadmin-portal/src/
  lib/
    api-client.ts          # Axios instance — attaches JWT, base URL
    auth.ts                # Login, logout, token helpers
    query-client.ts        # TanStack QueryClient singleton
  types/
    tenant.ts              # Tenant, TenantStatus, TenantSummary types
    dashboard.ts           # DashboardMetrics, TenantGrowthPoint types
    auth.ts                # SuperAdminSession type
  components/
    layout/
      Sidebar.tsx          # Full sidebar with all nav items + locked state
      PageHeader.tsx       # Page title + subtitle + right-side actions slot
      AlertBanner.tsx      # Amber dismissible alert strip
      QueryProvider.tsx    # TanStack QueryClient provider (client component)
    dashboard/
      MetricCard.tsx       # Single KPI card (label, value, delta chip)
      TenantGrowthChart.tsx# 12-month grouped bar chart (CSS-based)
      TenantTable.tsx      # Paginated tenant table with row actions
      TrialsExpiringSoon.tsx# Right-panel list of expiring trials
  app/
    (dashboard)/           # Route group — all protected pages
      layout.tsx           # Sidebar + main layout shell
      dashboard/page.tsx   # Dashboard page (replaces stub)
    login/page.tsx         # Login form (replaces stub)
    page.tsx               # Root redirect → /dashboard
```

### Frontend — modified files
```
frontend/superadmin-portal/
  package.json             # Add lucide-react
  middleware.ts            # Already correct — no change needed
  src/app/layout.tsx       # Wrap body with QueryProvider
```

### Backend — auth-service new files
```
services/auth-service/src/main/java/com/andikisha/auth/
  domain/model/
    SuperAdminSession.java               # Session entity (id, superAdminId, createdAt, expiresAt, revokedAt, ipAddress, userAgent)
  domain/repository/
    SuperAdminSessionRepository.java     # findByIdAndRevokedAtIsNull, findAllActiveByAdminId
  application/dto/response/
    SuperAdminSessionResponse.java       # record (id, createdAt, expiresAt, ipAddress, userAgent, current)
  application/dto/request/
    RotateJwtSecretRequest.java          # record (currentPassword)
  infrastructure/
    persistence/SuperAdminSessionRepositoryImpl.java  # (if custom queries needed)
  presentation/controller/
    SuperAdminSessionController.java     # GET /sessions, DELETE /sessions/{id}, POST /rotate-secret

services/auth-service/src/main/resources/db/migration/
  V9__add_superadmin_sessions.sql        # sessions table

services/auth-service/src/test/java/com/andikisha/auth/
  unit/SuperAdminSessionServiceTest.java
  e2e/SuperAdminSessionControllerTest.java
```

### Backend — auth-service modified files
```
services/auth-service/src/main/java/com/andikisha/auth/
  application/service/SuperAdminAuthService.java   # add createSession(), listSessions(), revokeSession(), rotateSecret()
```

---

## Task 1: Install lucide-react and add QueryProvider

**Files:**
- Modify: `frontend/superadmin-portal/package.json`
- Create: `frontend/superadmin-portal/src/components/layout/QueryProvider.tsx`
- Modify: `frontend/superadmin-portal/src/app/layout.tsx`

- [ ] **Step 1: Install lucide-react**

```bash
cd frontend/superadmin-portal && pnpm add lucide-react
```

Expected: `lucide-react` appears in `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Create QueryProvider**

```tsx
// src/components/layout/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 3: Wrap layout body with QueryProvider**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, DM_Mono } from "next/font/google";
import { QueryProvider } from "@/components/layout/QueryProvider";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AndikishaHR Super Admin", template: "%s | Super Admin" },
  description: "AndikishaHR platform administration portal",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build passes**

```bash
cd frontend/superadmin-portal && pnpm type-check
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/superadmin-portal/src/components/layout/QueryProvider.tsx \
        frontend/superadmin-portal/src/app/layout.tsx \
        frontend/superadmin-portal/package.json \
        frontend/superadmin-portal/pnpm-lock.yaml
git commit -m "feat(superadmin): add lucide-react and TanStack QueryProvider"
```

---

## Task 2: API client and type definitions

**Files:**
- Create: `frontend/superadmin-portal/src/lib/api-client.ts`
- Create: `frontend/superadmin-portal/src/lib/auth.ts`
- Create: `frontend/superadmin-portal/src/types/tenant.ts`
- Create: `frontend/superadmin-portal/src/types/dashboard.ts`
- Create: `frontend/superadmin-portal/src/types/auth.ts`

- [ ] **Step 1: Create typed API client**

```ts
// src/lib/api-client.ts
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from cookie on every request (client-side only)
apiClient.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("superadmin_token="))
      ?.split("=")[1];
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
```

- [ ] **Step 2: Create auth helpers**

```ts
// src/lib/auth.ts
import { apiClient } from "./api-client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    "/api/v1/superadmin/auth/login",
    payload
  );
  // Store in cookie (httpOnly not possible client-side; middleware validates)
  document.cookie = `superadmin_token=${data.accessToken}; path=/; max-age=${data.expiresIn}; SameSite=Strict`;
  return data;
}

export function logout() {
  document.cookie = "superadmin_token=; path=/; max-age=0";
  window.location.href = "/login";
}
```

- [ ] **Step 3: Create tenant types**

```ts
// src/types/tenant.ts
export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "ONBOARDING" | "CANCELLED";

export interface TenantSummary {
  id: string;
  companyName: string;
  slug: string;
  adminEmail: string;
  plan: string;
  status: TenantStatus;
  employeeCount: number | null;
  createdAt: string;
  trialExpiresAt: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
```

- [ ] **Step 4: Create dashboard types**

```ts
// src/types/dashboard.ts
export interface DashboardMetrics {
  totalTenants: number;
  activeTenants: number;
  trialsExpiringIn7Days: number;
  trialsExpiringIn48Hours: number;
  suspendedTenants: number;
  tenantDeltaThisMonth: number;
  activeDeltaThisMonth: number;
}

export interface TenantGrowthPoint {
  month: string; // "Jan", "Feb" ...
  newSignups: number;
  activeTenants: number;
}
```

- [ ] **Step 5: Create auth types**

```ts
// src/types/auth.ts
export interface SuperAdminSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  current: boolean;
}
```

- [ ] **Step 6: Verify types compile**

```bash
cd frontend/superadmin-portal && pnpm type-check
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/superadmin-portal/src/lib/ frontend/superadmin-portal/src/types/
git commit -m "feat(superadmin): add API client, auth helpers, and type definitions"
```

---

## Task 3: Sidebar component

**Files:**
- Create: `frontend/superadmin-portal/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar**

```tsx
// src/components/layout/Sidebar.tsx
import Link from "next/link";
import { LogoFull } from "@andikisha/ui";
import {
  Home, Building2, CreditCard, Flag, FileSearch, Settings2,
  Activity, ShieldCheck, Briefcase, MessageSquare, Users,
  FileInput, Database, Settings, LifeBuoy, ExternalLink,
  ChevronRight
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string | number;
  locked?: boolean;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Tenants", href: "/tenants", icon: Building2, badge: "—" },
      { label: "Plans & Licences", href: "/plans", icon: CreditCard },
      { label: "Feature Flags", href: "/feature-flags", icon: Flag },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Audit Log", href: "/audit", icon: FileSearch },
      { label: "Platform Config", href: "/config", icon: Settings2 },
      { label: "System Health", icon: Activity, locked: true },
      { label: "Security", icon: ShieldCheck, locked: true },
      { label: "Billing & Revenue", icon: Briefcase, locked: true },
      { label: "Communications", icon: MessageSquare, locked: true },
      { label: "Support & Ops", icon: Users, locked: true },
    ],
  },
  {
    label: "Advanced",
    items: [
      { label: "Data Migration", icon: FileInput, locked: true },
      { label: "Backup & DR", icon: Database, locked: true },
    ],
  },
];

function NavItemRow({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;

  const inner = (
    <span
      className={[
        "flex items-center gap-2.5 w-[248px] h-[38px] px-2.5 rounded-md text-sm font-medium transition-colors",
        item.locked
          ? "opacity-45 cursor-default text-gray-400"
          : active
          ? "bg-[#E8F5F0] text-[#0B3D2E] font-semibold border-l-2 border-[#E8A020] pl-[9px]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 cursor-pointer",
      ].join(" ")}
    >
      <Icon
        size={16}
        className={active ? "text-[#0B3D2E]" : "text-gray-400"}
        strokeWidth={2}
      />
      <span className="flex-1">{item.label}</span>
      {item.locked && (
        <span className="text-[9.5px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full tracking-wide">
          Soon
        </span>
      )}
      {item.badge !== undefined && !item.locked && (
        <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </span>
  );

  if (item.locked || !item.href) return <div>{inner}</div>;
  return <Link href={item.href}>{inner}</Link>;
}

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <LogoFull className="h-[26px] w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="text-[10.5px] font-bold text-[#166A50] uppercase tracking-[0.09em] px-2 pt-4 pb-1.5">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavItemRow
                key={item.label}
                item={item}
                active={!!item.href && activePath.startsWith(item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 w-[248px] h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings size={16} strokeWidth={2} className="text-gray-400" />
          Settings
        </Link>
        <div className="flex items-center gap-2.5 w-[248px] h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
          <LifeBuoy size={16} strokeWidth={2} className="text-gray-400" />
          <span className="flex-1">Support</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#27A870]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27A870]" />
            Online
          </span>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_API_URL ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 w-[248px] h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50"
        >
          <ExternalLink size={16} strokeWidth={2} className="text-gray-400" />
          <span className="flex-1">Open in browser</span>
          <ExternalLink size={12} className="text-gray-300" />
        </a>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend/superadmin-portal && pnpm type-check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/superadmin-portal/src/components/layout/Sidebar.tsx
git commit -m "feat(superadmin): add Sidebar component with all nav sections and locked state"
```

---

## Task 4: Dashboard route group layout (protected shell)

**Files:**
- Create: `frontend/superadmin-portal/src/app/(dashboard)/layout.tsx`
- Create: `frontend/superadmin-portal/src/components/layout/PageHeader.tsx`
- Create: `frontend/superadmin-portal/src/components/layout/AlertBanner.tsx`
- Modify: `frontend/superadmin-portal/src/app/page.tsx`

- [ ] **Step 1: Create PageHeader component**

```tsx
// src/components/layout/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 flex-shrink-0">
      <div className="flex items-center justify-between h-[73px] gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create AlertBanner component**

```tsx
// src/components/layout/AlertBanner.tsx
"use client";

import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  count: number;
  onReview: () => void;
}

export function AlertBanner({ count, onReview }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || count === 0) return null;

  return (
    <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-8 py-2.5 flex items-center gap-2.5 flex-shrink-0">
      <AlertCircle size={14} className="text-[#C98510] flex-shrink-0" />
      <span className="text-[13px] text-[#92400E] flex-1">
        <strong>{count} trial{count > 1 ? "s" : ""} expire{count === 1 ? "s" : ""} in 48 hours</strong>
        {" "}— action needed before tenants lose access.
      </span>
      <button
        onClick={onReview}
        className="text-[12.5px] font-bold text-[#C98510] border border-[#F59E0B] rounded-md px-3 py-1 hover:bg-[#FEF3DC] transition-colors whitespace-nowrap"
      >
        Review now →
      </button>
      <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 ml-1">
        <X size={14} />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard route group layout**

```tsx
// src/app/(dashboard)/layout.tsx
import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <Sidebar activePath={pathname} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Add x-pathname header in middleware**

Add one line to the existing middleware so the layout knows the current path:

```ts
// middleware.ts — inside the try block, before returning NextResponse.next()
// Add after the jwtVerify call succeeds:
const response = NextResponse.next();
response.headers.set("x-pathname", pathname);
return response;
```

The full middleware `try` block becomes:
```ts
try {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
  const { payload } = await jwtVerify(token, secret);

  if (payload.role !== "SUPER_ADMIN" || payload.tenantId !== "SYSTEM") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
} catch {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

- [ ] **Step 5: Redirect root to /dashboard**

```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/dashboard");
}
```

- [ ] **Step 6: Start dev server and verify layout renders**

```bash
cd frontend/superadmin-portal && pnpm dev
```

Open `http://localhost:3003` — should redirect to `/login`. Navigate to `/dashboard` after setting a test cookie — should show the sidebar on the left.

- [ ] **Step 7: Commit**

```bash
git add frontend/superadmin-portal/src/app/\(dashboard\)/layout.tsx \
        frontend/superadmin-portal/src/components/layout/PageHeader.tsx \
        frontend/superadmin-portal/src/components/layout/AlertBanner.tsx \
        frontend/superadmin-portal/src/app/page.tsx \
        frontend/superadmin-portal/middleware.ts
git commit -m "feat(superadmin): add protected dashboard layout, PageHeader, AlertBanner"
```

---

## Task 5: Login page

**Files:**
- Modify: `frontend/superadmin-portal/src/app/login/page.tsx`

- [ ] **Step 1: Build the login page**

```tsx
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoFull } from "@andikisha/ui";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm p-8">
        <div className="mb-8">
          <LogoFull className="h-7 w-auto" />
          <p className="mt-4 text-[13.5px] text-gray-500">
            Platform administration — superadmin access only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent"
              placeholder="superadmin@andikisha.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-60 text-[#02110C] font-bold rounded-lg py-2.5 text-[13.5px] transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test login page renders**

```bash
# With dev server running
open http://localhost:3003/login
```

Expected: White card with Andikisha logo, email + password fields, amber sign-in button.

- [ ] **Step 3: Commit**

```bash
git add frontend/superadmin-portal/src/app/login/page.tsx
git commit -m "feat(superadmin): add login page connected to superadmin auth endpoint"
```

---

## Task 6: Dashboard components — MetricCard and TrialsExpiringSoon

**Files:**
- Create: `frontend/superadmin-portal/src/components/dashboard/MetricCard.tsx`
- Create: `frontend/superadmin-portal/src/components/dashboard/TrialsExpiringSoon.tsx`

- [ ] **Step 1: Create MetricCard**

```tsx
// src/components/dashboard/MetricCard.tsx
import { LucideIcon } from "lucide-react";

type DeltaVariant = "up" | "down" | "warn";

interface MetricCardProps {
  label: string;
  value: number | string;
  delta: string;
  deltaVariant: DeltaVariant;
  icon: LucideIcon;
  colorVariant: "brand" | "green" | "amber" | "red";
}

const variantStyles = {
  brand: { border: "from-[#0B3D2E] to-[#27A870]", icon: "bg-[#E8F5F0] text-[#166A50]" },
  green: { border: "from-[#27A870] to-[#D1F5E6]", icon: "bg-[#D1F5E6] text-[#27A870]" },
  amber: { border: "from-[#E8A020] to-[#FEF3DC]", icon: "bg-[#FEF3DC] text-[#C98510]" },
  red:   { border: "from-[#EF4444] to-[#FEE2E2]", icon: "bg-[#FEE2E2] text-[#EF4444]" },
};

const deltaStyles: Record<DeltaVariant, string> = {
  up:   "bg-[#D1F5E6] text-[#0F5040]",
  down: "bg-[#FEE2E2] text-[#991B1B]",
  warn: "bg-[#FEF3DC] text-[#C98510]",
};

const valueStyles = {
  brand: "text-[#101828]",
  green: "text-[#101828]",
  amber: "text-[#C98510]",
  red:   "text-[#EF4444]",
};

export function MetricCard({
  label, value, delta, deltaVariant, icon: Icon, colorVariant,
}: MetricCardProps) {
  const s = variantStyles[colorVariant];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-[18px] relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
      {/* Gradient top border */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] rounded-t-xl bg-gradient-to-r ${s.border}`} />

      <div className="flex items-start justify-between mb-2.5">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em]">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.icon}`}>
          <Icon size={15} strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <p className={`text-[28px] font-extrabold leading-none tracking-tight ${valueStyles[colorVariant]}`}>
          {value}
        </p>
        <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${deltaStyles[deltaVariant]}`}>
          {delta}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TrialsExpiringSoon panel**

```tsx
// src/components/dashboard/TrialsExpiringSoon.tsx
import { TenantSummary } from "@/types/tenant";

function urgencyClass(daysLeft: number) {
  if (daysLeft <= 3) return "text-[#EF4444]";
  if (daysLeft <= 6) return "text-[#C98510]";
  return "text-[#27A870]";
}

function daysUntil(isoDate: string) {
  return Math.ceil(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

interface Props {
  tenants: TenantSummary[];
}

export function TrialsExpiringSoon({ tenants }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-gray-100">
        <p className="text-[13.5px] font-bold text-[#101828]">Trials Expiring Soon</p>
        <a href="/tenants?status=TRIAL" className="text-[12px] font-semibold text-[#166A50] flex items-center gap-0.5">
          Manage <span className="text-base leading-none">›</span>
        </a>
      </div>
      {tenants.map((t) => {
        const days = t.trialExpiresAt ? daysUntil(t.trialExpiresAt) : null;
        return (
          <div
            key={t.id}
            className="flex items-center justify-between px-[18px] py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-[13px] font-semibold text-[#101828]">{t.companyName}</p>
              <p className="text-[11px] text-gray-500">{t.plan} · {t.employeeCount ?? "—"} employees</p>
            </div>
            {days !== null && (
              <p className={`text-[11.5px] font-bold ${urgencyClass(days)}`}>
                {days}d left
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/superadmin-portal/src/components/dashboard/
git commit -m "feat(superadmin): add MetricCard and TrialsExpiringSoon dashboard components"
```

---

## Task 7: Dashboard components — TenantGrowthChart and TenantTable

**Files:**
- Create: `frontend/superadmin-portal/src/components/dashboard/TenantGrowthChart.tsx`
- Create: `frontend/superadmin-portal/src/components/dashboard/TenantTable.tsx`

- [ ] **Step 1: Create TenantGrowthChart**

```tsx
// src/components/dashboard/TenantGrowthChart.tsx
"use client";

import { useState } from "react";
import { TenantGrowthPoint } from "@/types/dashboard";

const PERIODS = ["24h", "7d", "30d", "3m", "12m"] as const;
type Period = (typeof PERIODS)[number];

interface Props {
  data: TenantGrowthPoint[];
}

export function TenantGrowthChart({ data }: Props) {
  const [period, setPeriod] = useState<Period>("12m");
  const maxActive = Math.max(...data.map((d) => d.activeTenants), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between px-6 pt-5 pb-0">
        <div>
          <p className="text-[15px] font-bold text-[#101828]">Tenant growth</p>
          <p className="text-[12.5px] text-gray-500 mt-0.5">New signups vs active tenants</p>
        </div>
        <button className="text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3.5 py-1.5 hover:bg-gray-50 transition-colors">
          View report
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex gap-0 px-6 pt-4 pb-0 border-b border-gray-100">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={[
              "text-[13px] font-medium px-4 py-1.5 border-b-2 transition-colors",
              period === p
                ? "text-[#0B3D2E] font-bold border-[#0B3D2E]"
                : "text-gray-500 border-transparent hover:text-gray-700",
            ].join(" ")}
          >
            {p === "12m" ? "12 months" : p === "3m" ? "3 months" : p === "30d" ? "30 days" : p === "7d" ? "7 days" : "24 hours"}
          </button>
        ))}
      </div>

      {/* Bars */}
      <div className="px-6 py-5">
        <div className="flex items-end gap-0 h-[180px] border-l border-b border-gray-100">
          {data.map((point) => {
            const activeH = Math.round((point.activeTenants / maxActive) * 160);
            const newH = Math.round((point.newSignups / maxActive) * 160);
            return (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 flex-1">
                  <div
                    className="w-3.5 rounded-t-[3px] bg-[#D1F5E6] hover:opacity-75 transition-opacity"
                    style={{ height: `${activeH}px` }}
                    title={`Active: ${point.activeTenants}`}
                  />
                  <div
                    className="w-3.5 rounded-t-[3px] bg-[#0B3D2E] hover:opacity-75 transition-opacity"
                    style={{ height: `${newH}px` }}
                    title={`New: ${point.newSignups}`}
                  />
                </div>
                <p className="text-[11.5px] text-gray-400 font-medium">{point.month}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-3 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#D1F5E6]" /> Active tenants
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0B3D2E]" /> New signups
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TenantTable**

```tsx
// src/components/dashboard/TenantTable.tsx
"use client";

import { TenantSummary, TenantStatus } from "@/types/tenant";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<TenantStatus, string> = {
  ACTIVE:     "bg-[#D1F5E6] text-[#0F5040]",
  TRIAL:      "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
  ONBOARDING: "bg-[#FEF3DC] text-[#C98510]",
  SUSPENDED:  "bg-[#FEE2E2] text-[#991B1B]",
  CANCELLED:  "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }: { status: TenantStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#D1F5E6] text-[#0B3D2E]",
  "bg-[#FEF3DC] text-[#C98510]",
  "bg-[#E8F5F0] text-[#166A50]",
  "bg-[#FEE2E2] text-[#991B1B]",
  "bg-gray-100 text-gray-600",
];

interface Props {
  tenants: TenantSummary[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function TenantTable({ tenants, total, page, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Table header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <p className="text-[15px] font-bold text-[#101828]">Tenants</p>
          <span className="text-[12px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-400 w-[200px]">
            <svg className="w-3.5 h-3.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
            <kbd className="ml-auto text-[10px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
          </div>
          <a
            href="/tenants/new"
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-semibold text-[13px] px-3.5 h-9 rounded-lg transition-colors"
          >
            + New Tenant
          </a>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead className="bg-[#FAFAFA]">
          <tr>
            <th className="w-11 px-4 h-11 text-left"><input type="checkbox" className="rounded accent-[#0B3D2E]" /></th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Company</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Admin email</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Created</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Status</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Employees</th>
            <th className="w-20 px-4 h-11" />
          </tr>
        </thead>
        <tbody>
          {tenants.map((t, i) => (
            <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer group transition-colors">
              <td className="px-4 h-[72px]"><input type="checkbox" className="rounded accent-[#0B3D2E]" /></td>
              <td className="px-4 h-[72px]">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(t.companyName)}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#101828]">{t.companyName}</p>
                    <p className="text-[11.5px] text-gray-400">@{t.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 h-[72px] text-[13px] text-gray-500">{t.adminEmail}</td>
              <td className="px-4 h-[72px] text-[13px] text-gray-500">
                {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 h-[72px]"><StatusBadge status={t.status} /></td>
              <td className="px-4 h-[72px] text-[13.5px] text-gray-600">{t.employeeCount ?? "—"}</td>
              <td className="px-4 h-[72px]">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <Pencil size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100">
        <p className="text-[13px] text-gray-500">
          Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> tenants
        </p>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-9 h-9 rounded-lg text-[13.5px] font-medium transition-colors ${
                i === page
                  ? "bg-[#0B3D2E] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/superadmin-portal/src/components/dashboard/TenantGrowthChart.tsx \
        frontend/superadmin-portal/src/components/dashboard/TenantTable.tsx
git commit -m "feat(superadmin): add TenantGrowthChart and TenantTable components"
```

---

## Task 8: Dashboard page — wire everything together

**Files:**
- Modify: `frontend/superadmin-portal/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Move stub page into route group and wire components**

```tsx
// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, CheckCircle, Clock, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TenantGrowthChart } from "@/components/dashboard/TenantGrowthChart";
import { TenantTable } from "@/components/dashboard/TenantTable";
import { TrialsExpiringSoon } from "@/components/dashboard/TrialsExpiringSoon";
import { DashboardMetrics, TenantGrowthPoint } from "@/types/dashboard";
import { PagedResponse, TenantSummary } from "@/types/tenant";

// Skeleton for metric cards
function MetricSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-[18px] animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-16" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const now = new Date();
  const subtitle = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }) + " · " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " EAT";

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: () => apiClient.get("/api/v1/superadmin/dashboard/metrics").then((r) => r.data),
  });

  const { data: growth } = useQuery<TenantGrowthPoint[]>({
    queryKey: ["tenant-growth"],
    queryFn: () => apiClient.get("/api/v1/superadmin/dashboard/growth").then((r) => r.data),
  });

  const { data: tenants } = useQuery<PagedResponse<TenantSummary>>({
    queryKey: ["tenants-list", page],
    queryFn: () =>
      apiClient.get("/api/v1/superadmin/tenants", { params: { page, size: 10 } }).then((r) => r.data),
  });

  const { data: expiringTrials } = useQuery<TenantSummary[]>({
    queryKey: ["expiring-trials"],
    queryFn: () =>
      apiClient.get("/api/v1/superadmin/tenants", {
        params: { status: "TRIAL", sort: "trialExpiresAt", size: 5 },
      }).then((r) => r.data.content),
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors">
              Export report
            </button>
            <a
              href="/tenants/new"
              className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
            >
              + New Tenant
            </a>
          </>
        }
      />

      <AlertBanner
        count={metrics?.trialsExpiringIn48Hours ?? 0}
        onReview={() => router.push("/tenants?status=TRIAL")}
      />

      {/* Quick tabs */}
      <div className="flex gap-2 px-8 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        {["Overview", "Tenants", "Trials Expiring", "Onboarding"].map((tab, i) => (
          <button
            key={tab}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-medium border transition-colors ${
              i === 0
                ? "bg-[#0B3D2E] text-white border-[#0B3D2E]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-5">
          {metricsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
          ) : (
            <>
              <MetricCard
                label="Total Tenants"
                value={metrics?.totalTenants ?? 0}
                delta={`↑ ${metrics?.tenantDeltaThisMonth ?? 0} this month`}
                deltaVariant="up"
                icon={Building2}
                colorVariant="brand"
              />
              <MetricCard
                label="Active"
                value={metrics?.activeTenants ?? 0}
                delta={`↑ ${metrics?.activeDeltaThisMonth ?? 0} from last month`}
                deltaVariant="up"
                icon={CheckCircle}
                colorVariant="green"
              />
              <MetricCard
                label="Trials Expiring (7d)"
                value={metrics?.trialsExpiringIn7Days ?? 0}
                delta={`⚠ ${metrics?.trialsExpiringIn48Hours ?? 0} expire in 48h`}
                deltaVariant="warn"
                icon={Clock}
                colorVariant="amber"
              />
              <MetricCard
                label="Suspended"
                value={metrics?.suspendedTenants ?? 0}
                delta="↑ 1 this week"
                deltaVariant="down"
                icon={XCircle}
                colorVariant="red"
              />
            </>
          )}
        </div>

        {/* Chart */}
        {growth && <TenantGrowthChart data={growth} />}

        {/* Table + Trials side by side */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            {tenants && (
              <TenantTable
                tenants={tenants.content}
                total={tenants.totalElements}
                page={page}
                pageSize={10}
                onPageChange={setPage}
              />
            )}
          </div>
          <div>
            {expiringTrials && <TrialsExpiringSoon tenants={expiringTrials} />}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Remove old stub dashboard page**

```bash
rm frontend/superadmin-portal/src/app/dashboard/page.tsx
# If the directory becomes empty, remove it too
rmdir frontend/superadmin-portal/src/app/dashboard 2>/dev/null || true
```

- [ ] **Step 3: Type-check**

```bash
cd frontend/superadmin-portal && pnpm type-check
```

Expected: No errors.

- [ ] **Step 4: Start dev server and verify visually**

```bash
cd frontend/superadmin-portal && pnpm dev
```

Open `http://localhost:3003/dashboard`. Set cookie `superadmin_token=<valid_jwt>` in browser devtools to bypass auth. Expected: full dashboard layout renders with skeleton loaders for metrics, then loads data (or shows empty states when no API is running).

- [ ] **Step 5: Commit**

```bash
git add frontend/superadmin-portal/src/app/\(dashboard\)/
git commit -m "feat(superadmin): wire dashboard page with metrics, chart, tenant table, and alert banner"
```

---

## Task 9: Backend — superadmin sessions Flyway migration

**Files:**
- Create: `services/auth-service/src/main/resources/db/migration/V9__add_superadmin_sessions.sql`

- [ ] **Step 1: Write the failing integration test first**

```java
// services/auth-service/src/test/java/com/andikisha/auth/e2e/SuperAdminSessionControllerTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class SuperAdminSessionControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void listSessions_returnsEmptyList_whenNoActiveSessions() throws Exception {
        // arrange — provision + login to get SYSTEM JWT
        String token = provisionAndLogin();

        // act
        mockMvc.perform(get("/api/v1/superadmin/auth/sessions")
                .header("Authorization", "Bearer " + token))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void revokeSession_returns204_forValidSessionId() throws Exception {
        String token = provisionAndLogin();
        // Get session ID from list endpoint
        String sessionId = getFirstSessionId(token);

        mockMvc.perform(delete("/api/v1/superadmin/auth/sessions/" + sessionId)
                .header("Authorization", "Bearer " + token))
               .andExpect(status().isNoContent());
    }
}
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd services/auth-service && ./gradlew test --tests "*SuperAdminSessionControllerTest" 2>&1 | tail -20
```

Expected: FAIL — table does not exist.

- [ ] **Step 3: Create the Flyway migration**

```sql
-- services/auth-service/src/main/resources/db/migration/V9__add_superadmin_sessions.sql
CREATE TABLE superadmin_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    ip_address  VARCHAR(64),
    user_agent  TEXT
);

CREATE INDEX idx_superadmin_sessions_admin_email ON superadmin_sessions(admin_email);
CREATE INDEX idx_superadmin_sessions_expires_at  ON superadmin_sessions(expires_at);
```

- [ ] **Step 4: Commit migration**

```bash
git add services/auth-service/src/main/resources/db/migration/V9__add_superadmin_sessions.sql \
        services/auth-service/src/test/java/com/andikisha/auth/e2e/SuperAdminSessionControllerTest.java
git commit -m "feat(auth): add superadmin_sessions Flyway migration and failing test"
```

---

## Task 10: Backend — SuperAdminSession entity and repository

**Files:**
- Create: `services/auth-service/src/main/java/com/andikisha/auth/domain/model/SuperAdminSession.java`
- Create: `services/auth-service/src/main/java/com/andikisha/auth/domain/repository/SuperAdminSessionRepository.java`

- [ ] **Step 1: Create entity**

```java
// domain/model/SuperAdminSession.java
package com.andikisha.auth.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "superadmin_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdminSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    public boolean isActive() {
        return revokedAt == null && Instant.now().isBefore(expiresAt);
    }
}
```

- [ ] **Step 2: Create repository**

```java
// domain/repository/SuperAdminSessionRepository.java
package com.andikisha.auth.domain.repository;

import com.andikisha.auth.domain.model.SuperAdminSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SuperAdminSessionRepository extends JpaRepository<SuperAdminSession, UUID> {

    List<SuperAdminSession> findByAdminEmailAndRevokedAtIsNull(String adminEmail);
}
```

- [ ] **Step 3: Commit**

```bash
git add services/auth-service/src/main/java/com/andikisha/auth/domain/
git commit -m "feat(auth): add SuperAdminSession entity and repository"
```

---

## Task 11: Backend — sessions service methods and controller

**Files:**
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/service/SuperAdminAuthService.java`
- Create: `services/auth-service/src/main/java/com/andikisha/auth/application/dto/response/SuperAdminSessionResponse.java`
- Create: `services/auth-service/src/main/java/com/andikisha/auth/presentation/controller/SuperAdminSessionController.java`

- [ ] **Step 1: Write unit test first**

```java
// src/test/java/com/andikisha/auth/unit/SuperAdminSessionServiceTest.java
@ExtendWith(MockitoExtension.class)
class SuperAdminSessionServiceTest {

    @Mock SuperAdminSessionRepository sessionRepository;
    @InjectMocks SuperAdminAuthService superAdminAuthService;

    @Test
    void listActiveSessions_returnsMappedResponses() {
        var session = SuperAdminSession.builder()
            .id(UUID.randomUUID())
            .adminEmail("admin@andikisha.com")
            .expiresAt(Instant.now().plusSeconds(3600))
            .ipAddress("127.0.0.1")
            .build();
        when(sessionRepository.findByAdminEmailAndRevokedAtIsNull("admin@andikisha.com"))
            .thenReturn(List.of(session));

        var result = superAdminAuthService.listActiveSessions("admin@andikisha.com", session.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).current()).isTrue();
    }

    @Test
    void revokeSession_setsRevokedAt_andSaves() {
        var id = UUID.randomUUID();
        var session = SuperAdminSession.builder().id(id).revokedAt(null).expiresAt(Instant.now().plusSeconds(3600)).build();
        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));

        superAdminAuthService.revokeSession(id);

        assertThat(session.getRevokedAt()).isNotNull();
        verify(sessionRepository).save(session);
    }
}
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd services/auth-service && ./gradlew test --tests "*SuperAdminSessionServiceTest" 2>&1 | tail -10
```

Expected: FAIL — methods don't exist yet.

- [ ] **Step 3: Create response DTO**

```java
// application/dto/response/SuperAdminSessionResponse.java
package com.andikisha.auth.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record SuperAdminSessionResponse(
    UUID id,
    Instant createdAt,
    Instant expiresAt,
    String ipAddress,
    String userAgent,
    boolean current
) {}
```

- [ ] **Step 4: Add methods to SuperAdminAuthService**

Add these methods to the existing `SuperAdminAuthService` class (do not remove existing methods):

```java
// Add field injection via constructor:
private final SuperAdminSessionRepository sessionRepository;

public List<SuperAdminSessionResponse> listActiveSessions(String adminEmail, UUID currentSessionId) {
    return sessionRepository.findByAdminEmailAndRevokedAtIsNull(adminEmail)
        .stream()
        .filter(SuperAdminSession::isActive)
        .map(s -> new SuperAdminSessionResponse(
            s.getId(), s.getCreatedAt(), s.getExpiresAt(),
            s.getIpAddress(), s.getUserAgent(),
            s.getId().equals(currentSessionId)
        ))
        .toList();
}

public void revokeSession(UUID sessionId) {
    SuperAdminSession session = sessionRepository.findById(sessionId)
        .orElseThrow(() -> new EntityNotFoundException("Session not found: " + sessionId));
    session.setRevokedAt(Instant.now());
    sessionRepository.save(session);
}

public SuperAdminSession createSession(String adminEmail, Instant expiresAt,
                                       String ipAddress, String userAgent) {
    return sessionRepository.save(
        SuperAdminSession.builder()
            .adminEmail(adminEmail)
            .expiresAt(expiresAt)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .build()
    );
}
```

- [ ] **Step 5: Create controller**

```java
// presentation/controller/SuperAdminSessionController.java
package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.response.SuperAdminSessionResponse;
import com.andikisha.auth.application.service.SuperAdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/superadmin/auth")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminSessionController {

    private final SuperAdminAuthService superAdminAuthService;

    @GetMapping("/sessions")
    public ResponseEntity<List<SuperAdminSessionResponse>> listSessions(
            @RequestAttribute("adminEmail") String adminEmail,
            @RequestAttribute("sessionId") UUID currentSessionId) {
        return ResponseEntity.ok(
            superAdminAuthService.listActiveSessions(adminEmail, currentSessionId)
        );
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(@PathVariable UUID sessionId) {
        superAdminAuthService.revokeSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 6: Run all auth-service tests**

```bash
cd services/auth-service && ./gradlew test 2>&1 | tail -20
```

Expected: All tests pass including the new session tests.

- [ ] **Step 7: Commit**

```bash
git add services/auth-service/src/main/java/com/andikisha/auth/ \
        services/auth-service/src/test/java/com/andikisha/auth/
git commit -m "feat(auth): add superadmin session list and revoke endpoints"
```

---

## Task 12: Backend — dashboard metrics aggregation endpoint

**Files:**
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/SuperAdminDashboardController.java`
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/DashboardMetricsResponse.java`
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantGrowthPointResponse.java`

- [ ] **Step 1: Write failing test**

```java
// src/test/java/com/andikisha/tenant/e2e/SuperAdminDashboardControllerTest.java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@AutoConfigureMockMvc
class SuperAdminDashboardControllerTest {

    @Test
    void getMetrics_returns200_withSystemScopedJwt() throws Exception {
        mockMvc.perform(get("/api/v1/superadmin/dashboard/metrics")
                .header("Authorization", "Bearer " + SYSTEM_JWT))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.totalTenants").isNumber())
               .andExpect(jsonPath("$.activeTenants").isNumber())
               .andExpect(jsonPath("$.trialsExpiringIn7Days").isNumber())
               .andExpect(jsonPath("$.trialsExpiringIn48Hours").isNumber())
               .andExpect(jsonPath("$.suspendedTenants").isNumber());
    }

    @Test
    void getGrowth_returns12MonthlyPoints() throws Exception {
        mockMvc.perform(get("/api/v1/superadmin/dashboard/growth")
                .header("Authorization", "Bearer " + SYSTEM_JWT))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray())
               .andExpect(jsonPath("$.length()").value(12));
    }
}
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd services/tenant-service && ./gradlew test --tests "*SuperAdminDashboardControllerTest" 2>&1 | tail -10
```

Expected: FAIL — 404 Not Found.

- [ ] **Step 3: Create response DTOs**

```java
// application/dto/response/DashboardMetricsResponse.java
package com.andikisha.tenant.application.dto.response;

public record DashboardMetricsResponse(
    long totalTenants,
    long activeTenants,
    long trialsExpiringIn7Days,
    long trialsExpiringIn48Hours,
    long suspendedTenants,
    long tenantDeltaThisMonth,
    long activeDeltaThisMonth
) {}

// application/dto/response/TenantGrowthPointResponse.java
public record TenantGrowthPointResponse(
    String month,
    long newSignups,
    long activeTenants
) {}
```

- [ ] **Step 4: Create controller**

```java
// presentation/controller/SuperAdminDashboardController.java
package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.dto.response.DashboardMetricsResponse;
import com.andikisha.tenant.application.dto.response.TenantGrowthPointResponse;
import com.andikisha.tenant.application.service.SuperAdminTenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/superadmin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminDashboardController {

    private final SuperAdminTenantService superAdminTenantService;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        return ResponseEntity.ok(superAdminTenantService.getDashboardMetrics());
    }

    @GetMapping("/growth")
    public ResponseEntity<List<TenantGrowthPointResponse>> getGrowth() {
        return ResponseEntity.ok(superAdminTenantService.getTenantGrowth12Months());
    }
}
```

- [ ] **Step 5: Add methods to SuperAdminTenantService**

```java
// Add to existing SuperAdminTenantService — do not remove existing methods

public DashboardMetricsResponse getDashboardMetrics() {
    Instant now = Instant.now();
    Instant in7Days = now.plus(7, ChronoUnit.DAYS);
    Instant in48Hours = now.plus(48, ChronoUnit.HOURS);
    Instant startOfMonth = now.truncatedTo(ChronoUnit.DAYS)
        .minus(now.atZone(ZoneOffset.UTC).getDayOfMonth() - 1, ChronoUnit.DAYS);

    return new DashboardMetricsResponse(
        tenantRepository.count(),
        tenantRepository.countByStatus(TenantStatus.ACTIVE),
        tenantRepository.countByStatusAndTrialExpiresAtBetween(TenantStatus.TRIAL, now, in7Days),
        tenantRepository.countByStatusAndTrialExpiresAtBetween(TenantStatus.TRIAL, now, in48Hours),
        tenantRepository.countByStatus(TenantStatus.SUSPENDED),
        tenantRepository.countByCreatedAtAfter(startOfMonth),
        tenantRepository.countByStatusAndCreatedAtAfter(TenantStatus.ACTIVE, startOfMonth)
    );
}

public List<TenantGrowthPointResponse> getTenantGrowth12Months() {
    Instant start = Instant.now().minus(365, ChronoUnit.DAYS);
    // Raw query — each element is [month_label, new_count, active_count]
    return tenantRepository.findMonthlyGrowth(start).stream()
        .map(row -> new TenantGrowthPointResponse(
            (String) row[0],
            ((Number) row[1]).longValue(),
            ((Number) row[2]).longValue()
        ))
        .toList();
}
```

- [ ] **Step 6: Add repository query methods**

Add to the existing `TenantRepository` interface:

```java
long countByStatus(TenantStatus status);

long countByStatusAndTrialExpiresAtBetween(TenantStatus status, Instant from, Instant to);

long countByCreatedAtAfter(Instant after);

long countByStatusAndCreatedAtAfter(TenantStatus status, Instant after);

@Query("""
    SELECT TO_CHAR(DATE_TRUNC('month', t.createdAt), 'Mon') AS month,
           COUNT(t) AS newSignups,
           SUM(CASE WHEN t.status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeTenants
    FROM Tenant t
    WHERE t.createdAt >= :start
    GROUP BY DATE_TRUNC('month', t.createdAt)
    ORDER BY DATE_TRUNC('month', t.createdAt)
    """)
List<Object[]> findMonthlyGrowth(@Param("start") Instant start);
```

- [ ] **Step 7: Run all tenant-service tests**

```bash
cd services/tenant-service && ./gradlew test 2>&1 | tail -20
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add services/tenant-service/src/
git commit -m "feat(tenant): add superadmin dashboard metrics and growth aggregation endpoints"
```

---

## Task 13: Final integration check and `.env.local`

**Files:**
- Create: `frontend/superadmin-portal/.env.local` (gitignored — do not commit)

- [ ] **Step 1: Create local env file**

```bash
# frontend/superadmin-portal/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
JWT_SECRET=<your_dev_jwt_secret_from_auth_service_env>
```

Copy the JWT_SECRET value from `services/auth-service/.env.local` or your dev env file.

- [ ] **Step 2: Start all required services**

```bash
# In separate terminals:
cd services/auth-service   && ./gradlew bootRun
cd services/tenant-service && ./gradlew bootRun
cd frontend/superadmin-portal && pnpm dev
```

- [ ] **Step 3: Full login flow test**

1. Open `http://localhost:3003` — should redirect to `/login`
2. Enter superadmin credentials — should redirect to `/dashboard`
3. Dashboard should show metric cards loading → populated from API
4. Tenant growth chart should render 12 months of bars
5. Tenant table should show paginated list with working Previous/Next

- [ ] **Step 4: Verify sidebar active states**

Navigate to different pages — the sidebar active highlight should follow the current route.

- [ ] **Step 5: Tag the Plan 1 completion**

```bash
git tag superadmin-plan1-complete
git push origin superadmin-plan1-complete
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| Auth flow — login, JWT cookie, middleware | Tasks 4, 5 |
| Sidebar — all sections, locked Phase 2 items, section labels | Task 3 |
| Dashboard — alert banner, metric cards, chart, tenant table | Tasks 6, 7, 8 |
| Dashboard — alert banner for trials expiring in 48h | Task 8 |
| Quick-action tabs | Task 8 |
| Skeleton loaders | Task 8 (`MetricSkeleton`) |
| Andikisha logo in sidebar | Task 3 (LogoFull component) |
| Brand colors (amber CTA, green active state) | Tasks 3–8 (Tailwind classes throughout) |
| Auth backend — list sessions | Tasks 9, 10, 11 |
| Auth backend — revoke session | Task 11 |
| Dashboard metrics aggregation endpoint | Task 12 |
| Tenant growth chart endpoint | Task 12 |

**Gaps identified and addressed:**
- `NEXT_PUBLIC_API_URL` env var — added in Task 13
- `superadmin_token` cookie name matches existing middleware — consistent throughout
- `x-pathname` header for sidebar active state — added in Task 4

**Placeholder scan:** No TBDs, no "implement later", all code blocks present and complete.

**Type consistency:** `TenantSummary`, `DashboardMetrics`, `TenantGrowthPoint` defined in Task 2 and used consistently in Tasks 6–8. `SuperAdminSessionResponse` record defined in Task 11 and returned by controller in Task 11.
