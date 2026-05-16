# @andikisha/ui — Library Audit Report

**Date**: 2026-05-13  
**Audited path**: `frontend/packages/ui/src/`  
**Total source files**: 43 (41 in `components/`, 2 in `lib/`, 1 `utils.ts`)  
**Purpose**: Pre-refinement read-only audit. No code was changed.

---

## Audit 0.1: Component Inventory

### Classification key
- **T1**: Tier 1 — pure visual primitive, no domain knowledge  
- **T2-P**: Tier 2 pattern — composed primitive that recurs across screens  
- **T2-C**: Tier 2 chrome — layout shell  
- **T3**: Tier 3 — domain-coupled, should not be in the library  
- **Infra**: Infrastructure provider / hook

| File | Export name(s) | Tier | Wraps | Portal assumptions | Description |
|---|---|---|---|---|---|
| `Avatar.tsx` | `Avatar` | T1 | — | none | Initials or image avatar in xs/sm/md/lg sizes |
| `Badge.tsx` | `Badge`, `BadgeStatus` | T1 | — | none | Status badge with predefined HR workflow statuses (approved, pending, rejected, etc.) |
| `BaseModal.tsx` | `BaseModal` | T1 (legacy) | — | none | Bare `role=dialog` container with Escape handler. No Radix. Marked legacy. |
| `button.tsx` | `Button`, `ButtonVariant`, `ButtonSize` | T1 | — | none | Button with 6 variants (primary, cta, secondary, ghost, danger, outline) |
| `Checkbox.tsx` | `Checkbox` | T1 | — | none | Styled checkbox input |
| `CommandPalette.tsx` | `CommandPalette`, `CommandGroup`, `CommandItem`, `CommandPaletteProps` | T2-P | Radix Dialog + cmdk | none | ⌘K search palette. Listens to keyboard event, renders Radix Dialog + cmdk Command |
| `DataTable.tsx` | `DataTable` | T2-P | — | none | Table with column config, loading skeleton rows, empty state, row click handler |
| `Dialog.tsx` | `DialogRoot`, `DialogTrigger`, `DialogClose`, `DialogContent` | T1 | Radix Dialog | none | Thin Radix Dialog wrapper with AndikishaHR styling |
| `Dropdown.tsx` | `DropdownRoot`, `DropdownTrigger`, `DropdownContent`, `DropdownItem`, `DropdownSeparator`, `DropdownLabel` | T1 | Radix Dropdown | none | Radix Dropdown wrapper |
| `EmployeeShell.tsx` | `EmployeeShell`, `BottomNavItem` | T2-C | — | none | Mobile-first PWA shell: bottom nav on mobile, left rail on desktop. Nav as props. |
| `EmptyState.tsx` | `EmptyState` | T2-P | — | none | Centred icon + title + description + optional action |
| `Eyebrow.tsx` | `Eyebrow` | T1 | — | none | Small uppercase label above headings |
| `FormField.tsx` | `FormField` | T1 | — | none | Label + children + hint + error wrapper |
| `InlineAlert.tsx` | `InlineAlert` | T2-P | — | none | Inline alert: info / success / warning / error with optional Retry button |
| `Input.tsx` | `Input` | T1 | — | none | Styled text input |
| `KbdHint.tsx` | `KbdHint` | T1 | — | none | `<kbd>` styled key hint |
| `KpiGroup.tsx` | `KpiGroup` | T2-P | — | none | Grid wrapper for 2/3/4 KPI cards |
| `LogoFull.tsx` | `LogoFull` | Brand | — | none | Full AndikishaHR wordmark SVG |
| `Logomark.tsx` | `Logomark` | Brand | — | none | AndikishaHR logomark SVG only |
| `MoneyAmount.tsx` | `MoneyAmount` | T1 | — | KES currency default | KES-formatted number with size variants. Uses inline `toLocaleString("en-KE")` — no shared formatter. |
| `NavRail.tsx` | `NavRail`, `NavRailItem`, `NavRailGroup` | T2-C | — | none | Sidebar navigation rail with items, groups, dark/light themes, locked state, badges |
| `OfflineBadge.tsx` | `OfflineBadge` | T2-P | `useOnlineStatus` | none | Shows "Offline" pill when browser is offline |
| `PageHeader.tsx` | `PageHeader` | T2-C | — | hardcodes ⌘K dispatch | Page title + subtitle + search trigger + actions. Hardcodes `h-[87px]` height to match shell sidebar. |
| `PermissionGate.tsx` | `PermissionGate` | T2-P | `useCurrentRole` | single role only | Renders children if `useCurrentRole()` is in the `allow` array. Single-role only, no `anyOf` pattern. |
| `ProfileMenu.tsx` | `ProfileMenu` | T2-C | Dropdown, Avatar, RoleBadge | none | User avatar dropdown: name, email, role badge, Profile, Settings, Sign out |
| `QueryProvider.tsx` | `QueryProvider` | Infra | TanStack Query | none | QueryClient provider with staleTime=30s, retry=1 |
| `RoleBadge.tsx` | `RoleBadge` | T1 | — | none | Coloured role label for all 7 roles |
| `Select.tsx` | `Select` | T1 | — | none | Styled select input |
| `Sheet.tsx` | `SheetRoot`, `SheetTrigger`, `SheetClose`, `SheetContent` | T1 | Radix Dialog | none | Radix Dialog configured as a slide-in sheet |
| `SidebarShell.tsx` | `SidebarShell`, `NavItem`, `NavSection` | T2-C (legacy) | — | bakes in user card | Older sidebar shell. Takes nav as `NavSection[]` prop. Bakes in a fixed user avatar + email + role at the bottom. Marked legacy. |
| `Skeleton.tsx` | `Skeleton`, `SkeletonText` | T1 | — | none | Animated pulse skeleton rect; `SkeletonText` stacks multiple lines |
| `Spinner.tsx` | `Spinner` | T1 | — | none | Animated loading spinner |
| `StatCard.tsx` | `StatCard` | T2-P | — | none | Single KPI card: label + large value + optional change badge + sub-label |
| `SuperAdminShell.tsx` | `SuperAdminShell` | T2-C | — | none | White 280px left-rail sidebar + main content. Adds `impersonationBanner` slot. **Nav as props.** |
| `Switch.tsx` | `Switch` | T1 | — | none | Toggle switch |
| `Tag.tsx` | `Tag`, `tagColorFor`, `TagColor` | T1 | — | none | Coloured tag/chip; `tagColorFor` deterministically assigns a colour from a string |
| `TenantAdminShell.tsx` | `TenantAdminShell` | T2-C | — | none | White 280px left-rail sidebar + main content. Nav as props. |
| `Textarea.tsx` | `Textarea` | T1 | — | none | Styled textarea |
| `Toaster.tsx` | `ToastProvider`, `useToast` | Infra | — | none | Toast notification context + hook + fixed-position renderer |
| `Tooltip.tsx` | `Tooltip` | T1 | Radix Tooltip | none | Radix Tooltip wrapper |
| `TopBar.tsx` | `TopBar` | T2-C | — | none | Flexible 56px top bar: left / center / right slots. Impersonation amber border option. |
| `lib/useCurrentRole.ts` | `useCurrentRole`, `RoleContext`, `UserRole` | Infra | — | single role only | Returns `UserRole \| null` from React context. **No JWT decode. No API call.** |
| `lib/useOnlineStatus.ts` | `useOnlineStatus` | Infra | — | browser only | Browser online/offline via `navigator.onLine` + event listeners |

**No Tier 3 components found.** All components are generic enough to serve multiple portals. `Badge.tsx` contains HR workflow status values but these are reused across every portal surface — relocating it would cause more harm than good.

---

## Audit 0.2: Shell Components

### TenantAdminShell

```tsx
interface TenantAdminShellProps {
  nav: ReactNode;          // nav items — passed as children, not hardcoded
  navFooter?: ReactNode;   // bottom of sidebar — passed as children
  children: ReactNode;
  className?: string;
}
```

**Layout**: 280px white left rail + flex-1 main content. No top bar. Logo hard-coded inside the shell at h-[87px] to align with `PageHeader`. Nav is fully prop-driven — ✅ **correctly abstracted**.

**No portal-specific assumptions** beyond the logo (which is brand, not portal-specific) and sidebar dimensions (which match the SmartHR `index.html` reference).

**Use case**: `tenant-portal` `/admin/*` route group layout. Currently in use via `(admin)/layout.tsx`.

---

### SuperAdminShell

```tsx
interface SuperAdminShellProps {
  nav: ReactNode;
  navFooter?: ReactNode;
  impersonationBanner?: ReactNode;  // amber strip for tenant impersonation
  children: ReactNode;
  className?: string;
}
```

**Layout**: **IDENTICAL to `TenantAdminShell`** — 280px white left rail + main content. The only difference is the `impersonationBanner` slot.

**⚠ Critical gap**: This is a sidebar layout, not a horizontal navigation layout. The prompt's architectural context states that `platform-portal` uses a **horizontal navigation layout** (reference: `template/smarthr-html/layout-horizontal.html`). `SuperAdminShell` does not provide this. A new `HorizontalShell` component must be built for `platform-portal`.

**Recommendation**: Keep `SuperAdminShell` as the sidebar variant for platform-portal pages that have sidebar sub-navigation, but build `HorizontalShell` as the primary platform-portal app shell. The name `SuperAdminShell` may be repurposed or retired in Phase 2.

---

### EmployeeShell

```tsx
interface EmployeeShellProps {
  bottomNav: BottomNavItem[];        // mobile bottom nav items — prop-driven
  desktopNav?: ReactNode;            // left rail nav on desktop — prop-driven
  desktopNavFooter?: ReactNode;
  topRight?: ReactNode;              // notification / language toggle slot
  topCenter?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface BottomNavItem {
  label: string;
  href: string;
  icon: ElementType;
  active?: boolean;
}
```

**Layout**: Mobile-first PWA shell. Mobile: 48px top bar + scrollable content + 64px bottom nav. Desktop (lg+): 200px left rail + content. Nav is fully prop-driven — ✅ **correctly abstracted**.

**Use case**: `tenant-portal` `/my/*` route group layout.

---

### SidebarShell (legacy)

```tsx
interface SidebarShellProps {
  nav: NavSection[];     // nav items as typed sections — prop-driven
  activePath: string;    // current path for active state calculation
  userEmail: string;     // baked into user card at bottom
  userRole: string;      // baked into user card at bottom (free string, not typed role)
}
```

**Layout**: 280px white sidebar + no main content area (it renders only the sidebar `<aside>`, not the full shell). Has a hardcoded user avatar + email + role at the bottom.

**Issues**: Not a complete shell (no main column). The `userRole` prop is `string` not `UserRole`, losing type safety. The user card bakes in specific layout decisions that aren't configurable. Marked as "Legacy" in `index.ts`. Used by 0 portals after the consolidation — no active consumers in `tenant-portal`.

**Recommendation**: Remove from the public API in Phase 2.2. No consumers in tenant-portal; platform-portal hasn't started.

---

## Audit 0.3: Tier 3 Components

**None found.** Every component is domain-agnostic.

The closest candidates and why they stay:

| Component | Why it stays |
|---|---|
| `Badge` | HR workflow statuses (approved, pending, etc.) apply across every portal surface and data type. Relocating would require duplicating it per portal. |
| `MoneyAmount` | Kenya-specific (KES default) but the entire platform targets Kenya. It belongs in the library. The KES default can be overridden via the `currency` prop. |
| `RoleBadge` | Knows all 7 roles but roles are a cross-cutting concern. Correct in the shared library. |

---

## Audit 0.4: Public API Surface

### Issues found

**1. Dead secondary barrel at `src/components/index.ts`**

This file exports 9 symbols (Button, LogoFull, Logomark, BaseModal, ToastProvider, useToast, PageHeader, QueryProvider, SidebarShell, NavItem, NavSection). It is NOT the entry point that `@andikisha/ui` resolves to — that is `src/index.ts`. The secondary barrel is never imported by any consumer. It duplicates exports already in `src/index.ts` and causes confusion about the true entry point.

**Action**: Delete `src/components/index.ts` in Phase 2.

**2. `BaseModal` marked legacy, actively used**

In `src/index.ts` under the `// Legacy` comment. But `tenant-portal` imports `BaseModal` in 5 files:
- `admin/employees/[employeeId]/page.tsx`
- `admin/payroll/[runId]/page.tsx`
- `admin/payroll/new/page.tsx`
- `admin/leave/_components/ApproveModal.tsx`
- `admin/leave/_components/RejectModal.tsx`

Migration path: replace with `DialogRoot` / `DialogContent` (Radix-based, accessible, already in the library). The `PendingLeavePanel` in the dashboard spec will use the Radix dialog for the reject popover — establish that pattern first, then migrate the legacy usages.

**3. `SidebarShell` is exported but has zero consumers in tenant-portal**

The consolidation replaced its use with `TenantAdminShell`. It can be removed from the public API once `platform-portal` confirms it won't use it.

**Complete export inventory** (from `src/index.ts`):

| Export | Kind |
|---|---|
| `cn` | Utility |
| `LogoFull`, `Logomark` | Component |
| `Button`, `ButtonVariant`, `ButtonSize` | Component + types |
| `Badge`, `BadgeStatus` | Component + type |
| `Avatar` | Component |
| `Tag`, `tagColorFor`, `TagColor` | Component + function + type |
| `Eyebrow` | Component |
| `KbdHint` | Component |
| `EmptyState` | Component |
| `MoneyAmount` | Component |
| `StatCard` | Component |
| `KpiGroup` | Component |
| `DataTable` | Component |
| `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `FormField` | Components |
| `Skeleton`, `SkeletonText`, `Spinner` | Components |
| `CommandPalette`, `CommandGroup`, `CommandItem`, `CommandPaletteProps` | Component + types |
| `Tooltip` | Component |
| `DropdownRoot`, `DropdownTrigger`, `DropdownContent`, `DropdownItem`, `DropdownSeparator`, `DropdownLabel` | Components |
| `DialogRoot`, `DialogTrigger`, `DialogClose`, `DialogContent` | Components |
| `SheetRoot`, `SheetTrigger`, `SheetClose`, `SheetContent` | Components |
| `InlineAlert` | Component |
| `useCurrentRole`, `RoleContext`, `UserRole` | Hook + context + type |
| `PermissionGate` | Component |
| `RoleBadge` | Component |
| `useOnlineStatus` | Hook |
| `OfflineBadge` | Component |
| `TopBar` | Component |
| `NavRail`, `NavRailItem`, `NavRailGroup` | Components |
| `BottomNavItem` | Type |
| `ProfileMenu` | Component |
| `SuperAdminShell`, `TenantAdminShell`, `EmployeeShell` | Components |
| `BaseModal` | Component (legacy) |
| `ToastProvider`, `useToast` | Component + hook |
| `PageHeader` | Component |
| `QueryProvider` | Component |
| `SidebarShell`, `NavItem`, `NavSection` | Component + types (legacy) |

**No dead exports** — every exported name points to an existing file.

**Missing exports** (files exist, not in `src/index.ts`): None. All component files are exported.

---

## Audit 0.5: Formatters and Utilities

| Utility | Status | Actual signature | Matches spec |
|---|---|---|---|
| `cn` | ✅ EXISTS | `cn(...inputs: ClassValue[]): string` via clsx + tailwind-merge | ✅ yes |
| `formatMoney` | ❌ MISSING | — | No standalone function |
| `formatDate` | ❌ MISSING | — | No date formatting utility |
| `formatTime` | ❌ MISSING | — | No time formatting utility |

**`MoneyAmount` and `formatMoney` relationship**: `MoneyAmount` duplicates its formatting logic inline using `amount.toLocaleString("en-KE", { minimumFractionDigits: cents ? 2 : 0 })`. The spec (dashboard-redesign.md) requires that `MoneyAmount` eventually use `formatMoney` internally to avoid logic duplication. Currently it does not.

**`formatMoney` spec**: Must produce `KES 250,000.00` (non-breaking space ` ` between currency code and amount, always 2 decimal places, comma thousands separator, `en-KE` locale).

**`formatDate` spec**: Must produce `"13 May 2026"` (dd MMM yyyy, Africa/Nairobi timezone).

**`formatTime` spec**: Must produce `"14:30"` (HH:mm, 24-hour, Africa/Nairobi timezone regardless of browser locale).

---

## Audit 0.6: Tailwind Preset and Brand Tokens

### Comparison: preset vs `andikishahr-brand-colours.md`

| Token | In brand-colours.md | In tailwind-preset.ts | Status |
|---|---|---|---|
| `brand-950` | ✅ `#071e13` | ✅ `#071e13` | Match |
| `brand-900` | ✅ `#0b3d2e` | ✅ `#0b3d2e` | Match |
| `brand-800` | ✅ `#0f5040` | ✅ `#0f5040` | Match |
| `brand-700` | ✅ `#166a50` | ✅ `#166a50` | Match |
| `brand-500` | ✅ `#27a870` | ✅ `#27a870` | Match |
| `brand-100` | ✅ `#d1f5e6` | ✅ `#d1f5e6` | Match |
| `brand-50` | ✅ `#e8f5f0` | ✅ `#e8f5f0` | Match |
| `amber` | ✅ `#e8a020` | ✅ `#e8a020` | Match |
| `amber-dark` | ✅ `#c98510` | ✅ `#c98510` | Match |
| `amber-light` | ✅ `#fef3dc` | ✅ `#fef3dc` | Match |
| `surface` | ✅ `#ffffff` | ✅ `#ffffff` | Match |
| `surface-alt` | ✅ `#f8f7f4` | ✅ `#f8f7f4` | Match |
| `near-black` | ✅ `#02110c` | ✅ `#02110c` | Match |
| `whatsapp` | ✅ `#25d366` | ✅ `#25d366` | Match |
| `error` | ✅ `#ef4444` | ✅ `#ef4444` | Match |
| `info-blue` | ✅ `#60a5fa` | ❌ MISSING | Gap |
| `neutral-900` | ✅ `#111111` | ❌ MISSING | Gap |
| `neutral-700` | ✅ `#374151` | ❌ MISSING | Gap |
| `neutral-600` | ✅ `#4b5563` | ❌ MISSING | Gap |
| `neutral-400` | ✅ `#9ca3af` | ❌ MISSING | Gap |
| `neutral-200` | ✅ `#e5e7eb` | ❌ MISSING | Gap |
| `neutral-100` | ✅ `#f3f4f6` | ❌ MISSING | Gap |

**Significant gap**: The entire neutral scale (`neutral-900` through `neutral-100`) is missing from the Tailwind preset. This causes components to use raw hex values everywhere (`text-[#374151]`, `border-[#E5E7EB]`, `bg-[#F3F4F6]`). Token consistency is broken — changing a neutral shade requires a grep-and-replace across 20+ component files instead of updating a single token.

### Font families

**Current preset:**
```ts
fontFamily: {
  display: ["var(--font-montserrat)", "sans-serif"],
  body: ["var(--font-montserrat)", "sans-serif"],
  mono: ["var(--font-dm-mono)", "monospace"],
}
```

**Conflict across documents:**
- Current preset: Montserrat (display and body)
- Dashboard spec (`2026-05-13-dashboard-redesign.md`): Roboto
- Prompt A.6 spec: Bricolage Grotesque (display), DM Sans (body)
- Current `tenant-portal` root layout: Roboto (per login page redesign)

**⚠ Decision required from Lawrence**: Which font family is canonical? The preset must match whatever the portals load via `next/font/google`. Currently the preset assumes `--font-montserrat` but `tenant-portal` injects `--font-roboto`. The `font-body` and `font-display` Tailwind utilities are broken in `tenant-portal` because the CSS variable names don't match.

---

## Audit 0.7: Permissions and Roles Plumbing

### `useCurrentRole`

```ts
export type UserRole =
  | "SUPER_ADMIN" | "ADMIN" | "HR_MANAGER" | "PAYROLL_OFFICER"
  | "HR" | "LINE_MANAGER" | "EMPLOYEE" | null;

export const RoleContext = createContext<UserRole>(null);

export function useCurrentRole(): UserRole {
  return useContext(RoleContext);
}
```

**Critical finding**: `useCurrentRole` returns a **single** `UserRole | null`. It does not support multi-role users (Prompt B requirement: a user holding both `EMPLOYEE` and `HR_MANAGER` simultaneously).

**Equally critical finding**: `RoleContext` defaults to `null`. Neither `tenant-portal` nor any other portal currently provides `RoleContext.Provider`. The hook always returns `null`. **Role gating (`PermissionGate`) is silently broken everywhere** — it renders `fallback` for every gate because the role is always `null`.

### `PermissionGate`

```tsx
interface PermissionGateProps {
  allow: NonNullable<UserRole>[];
  fallback?: ReactNode;
  children: ReactNode;
}
```

**Limitations**:
1. Single-role comparison — `allow.includes(role)` where `role` is a single string. Multi-role users are unsupported.
2. No `anyOf` prop (required by dashboard spec).
3. Broken because `RoleContext` is never provided.

### `RoleBadge`

Knows all 7 roles with correct labels and colour mapping. ✅ Works correctly as a display component.

---

## Audit 0.8: Current User Hook

**No `useCurrentUser` hook exists.**

The closest is `useCurrentRole` which:
- Returns a single `UserRole | null`
- Does not decode a JWT
- Does not make an API call
- Relies on a `RoleContext.Provider` that no portal currently provides

**Gap**: The dashboard redesign spec and Prompt B both require a hook that returns:
- `userId: string`
- `tenantId: string`
- `email: string`
- `fullName?: string`
- `roles: UserRole[]` (array, not single value — required for multi-role Prompt B)
- `managedDepartmentIds?: string[]`

The hook must also expose convenience wrappers:
- `useHasRole(role: UserRole): boolean`
- `useHasAnyRole(...roles: UserRole[]): boolean`
- `useIsAuthenticated(): boolean`

**Recommended implementation**: Client-side JWT decode from the `tenant_token` cookie using `jose` (already in `tenant-portal/package.json`). The hook reads the cookie, decodes the JWT, and returns typed user data. Documented as soft UI gating only — the backend enforces real authorization. When Prompt B lands (auth-service `/me` endpoint), the internals swap to an API call with no consumer changes.

The `useCurrentRole` hook becomes a thin wrapper: `useCurrentRole() => useCurrentUser().roles[0] ?? null` (for backwards compatibility during migration).

---

## Audit 0.9: Dependency Tree

**All dependencies are clean.** No forbidden packages found.

### `package.json` dependencies
| Package | Version | Status |
|---|---|---|
| `clsx` | `^2.1.0` | ✅ approved |
| `cmdk` | `^1.1.1` | ✅ approved |
| `tailwind-merge` | `^2.6.0` | ✅ approved |
| `@radix-ui/react-dialog` | `^1.1.0` | ✅ approved |
| `@radix-ui/react-dropdown-menu` | `^2.1.0` | ✅ approved |
| `@radix-ui/react-tooltip` | `^1.1.0` | ✅ approved |

### Peer dependencies
| Package | Version | Status |
|---|---|---|
| `react` | `^19.0.0` | ✅ |
| `react-dom` | `^19.0.0` | ✅ |
| `next` | `^15.0.0` | ✅ |
| `lucide-react` | `^0.468.0` | ✅ approved |
| `@tanstack/react-query` | `^5.0.0` | ✅ approved |

**No forbidden dependencies**: bootstrap, react-bootstrap, antd, primereact, @fortawesome/*, react-feather, react-icons, weather-icons-react, react-country-flag, jquery, sass — none present.

**Note**: `@radix-ui/react-select` and `@radix-ui/react-tabs` are used in the portals directly (in `tenant-portal/package.json`) but are NOT in `@andikisha/ui/package.json`. The library does not yet export `Select` using Radix — it appears to be a custom styled element. If `Select` is meant to be Radix-based for accessibility, it needs `@radix-ui/react-select` added to the library's dependencies.

---

## Audit 0.10: SmartHR Coverage for Portal Needs

### `tenant-portal` (sidebar layout — `template/smarthr-html/index.html`)

| Need | Component | Status | Notes |
|---|---|---|---|
| App shell with sidebar | `TenantAdminShell` | ✅ exists | Nav as props, correctly abstracted |
| Top bar | `TopBar` | ✅ exists | 3 slots, impersonation mode |
| Sidebar nav items | `NavRail`, `NavRailItem`, `NavRailGroup` | ✅ exists | Dark/light themes, locked state, badges |
| Page header with title + actions | `PageHeader` | ✅ exists | Includes search trigger (⌘K dispatch) |
| KPI card group | `KpiGroup` + `StatCard` | ✅ exists | Grid 2/3/4 cols, value + change + sub-label |
| Data table | `DataTable` | ✅ exists | Loading skeleton, empty state, row click |
| Donut chart wrapper | — | ❌ MISSING | Dashboard spec needs `AttendanceDonut` + `DepartmentDonut`. No Recharts wrappers in library. |
| Bar chart wrapper | — | ❌ MISSING | Dashboard spec needs `PayrollBarChart`. No Recharts wrapper in library. |
| Empty state | `EmptyState` | ✅ exists | Icon + title + description + action |
| Loading skeleton | `Skeleton`, `SkeletonText` | ✅ exists | Single rect or multi-line text |
| Profile dropdown | `ProfileMenu` | ✅ exists | Avatar + name + email + role badge + actions |
| Toast notifications | `ToastProvider`, `useToast` | ✅ exists | success/error/warning, auto-dismiss 4s |
| Command palette | `CommandPalette` | ✅ exists | ⌘K, groups + items |
| Inline error/alert | `InlineAlert` | ✅ exists | 4 variants with optional Retry |
| Modal / dialog | `DialogRoot/Content` | ✅ exists | Radix Dialog, accessible |
| Permission gate | `PermissionGate` | ⚠ broken | `RoleContext` never provided; returns null always |

### `platform-portal` (horizontal layout — `template/smarthr-html/layout-horizontal.html`)

| Need | Component | Status | Notes |
|---|---|---|---|
| App shell with horizontal nav | — | ❌ MISSING | `SuperAdminShell` is a sidebar shell, not horizontal. `HorizontalShell` must be built. |
| Horizontal nav bar | — | ❌ MISSING | No `HorizontalNav` component. Template reference: `layout-horizontal.html` — full-width header with nav items as horizontal list + dropdowns. |
| Top bar (same as tenant) | `TopBar` | ✅ exists | Reusable |
| All KPI cards, tables, etc. | same as above | ✅ exists | Fully reusable |
| Impersonation banner | `SuperAdminShell.impersonationBanner` | ⚠ wrong shell | Slot exists in `SuperAdminShell` sidebar shell — needs to move to `HorizontalShell` |

---

## Audit 0.11: Portal Consumption

### What `tenant-portal` imports from `@andikisha/ui`

| Import | Used in |
|---|---|
| `QueryProvider`, `ToastProvider` | `app/layout.tsx` |
| `TenantAdminShell` | `app/(admin)/layout.tsx` |
| `EmployeeShell` | `components/layout/EmployeeClientShell.tsx` |
| `NavRailItem`, `NavRailGroup`, `cn`, `BottomNavItem` | `components/layout/AdminNav.tsx`, `EmployeeNav.tsx`, `Sidebar.tsx` |
| `CommandPalette` | `components/layout/TenantCommandPalette.tsx` |
| `LogoFull` | `app/login/page.tsx` |
| `PageHeader` | All 9 page files |
| `BaseModal`, `useToast` | 5 modal/page files |
| `MoneyAmount`, `Badge`, `BadgeStatus` | `app/(admin)/admin/dashboard/page.tsx` |
| `Button`, `InlineAlert`, `StatCard`, `KpiGroup`, `DataTable` | `app/(admin)/admin/dashboard/page.tsx` |

**Import path**: All imports use `from "@andikisha/ui"` (barrel import). ✅ Consistent.

**No local component duplication** of library components. ✅ Clean.

**One concern**: `Sidebar.tsx` in `tenant-portal/src/components/layout/` is functionally identical to `EmployeeNav.tsx` in the same folder — both export `TenantAdminNav`/`EmployeeDesktopNav` style components. After the consolidation, the `Sidebar.tsx` file (originally from admin-portal) and `AdminNav.tsx` (new) both exist. The `Sidebar.tsx` is now dead code — `AdminNav.tsx` replaced it in `(admin)/layout.tsx`. This is a leftover from the consolidation.

---

## Refinement Plan

### Priority 1 — Blocking portal work (do before any dashboard implementation)

| Refinement | Risk | Effort |
|---|---|---|
| **Build `useCurrentUser` hook** with JWT decode, multi-role support (`roles: UserRole[]`), `useHasRole`, `useHasAnyRole`, `useIsAuthenticated` | High — breaks existing `useCurrentRole` API; must migrate `PermissionGate` and all consumers | Medium |
| **Wire `RoleContext.Provider` in portals** or remove it in favour of the new hook | High — role gating is currently broken everywhere | Low |
| **Build `HorizontalShell` component** for `platform-portal` — reference `template/smarthr-html/layout-horizontal.html` | Medium — new component, no consumers yet | Medium |
| **Add `formatMoney`, `formatDate`, `formatTime` utilities** | Low — new additions, no breaking changes | Low |
| **Fix font variable mismatch** — preset uses `--font-montserrat`, tenant-portal injects `--font-roboto`. `font-body` / `font-display` Tailwind utilities don't work in tenant-portal. **Decision required from Lawrence on canonical font.** | High — affects every page | Low (once decision made) |

### Priority 2 — Consistency and quality

| Refinement | Risk | Effort |
|---|---|---|
| **Add neutral scale to preset** (`neutral-900` through `neutral-100`, `info-blue`) | Low — additive only; components will continue to work with raw hex | Low |
| **Refactor `PermissionGate`** to add `anyOf` prop, consume `useCurrentUser().roles` | Medium — API addition, backward compatible | Low |
| **Delete `src/components/index.ts` secondary barrel** | Low — no external consumers | Trivial |
| **Remove `SidebarShell` from public API** (zero portal consumers) | Low — no consumers | Trivial |
| **Migrate `BaseModal` → `DialogRoot/Content`** in tenant-portal (5 files) | Low — functionally equivalent | Low |
| **Delete dead `Sidebar.tsx`** in tenant-portal (replaced by `AdminNav.tsx`) | Low — no consumers | Trivial |

### Priority 3 — Nice-to-have

| Refinement | Risk | Effort |
|---|---|---|
| **Add chart wrapper components** (`RechartsBarChart`, `RechartsDonut`) — Recharts-based, library-level | Low — additive | Medium |
| **Update `MoneyAmount` to use `formatMoney` internally** | Low — zero behaviour change | Trivial |
| **Add `packages/ui/README.md`** | Low | Low |
| **Update `CLAUDE.md`** with three-tier model | Low | Low |

### Decisions required from Lawrence before Phase 2

1. **Canonical font**: Roboto (current tenant-portal root layout), Montserrat (preset), or Bricolage Grotesque + DM Sans (prompt spec)? The preset `font-display` and `font-body` utilities are currently broken in tenant-portal because the variable names don't match. This must be resolved before any Phase 2 step touches styling.

2. **`HorizontalShell` vs retiring `SuperAdminShell`**: Should `SuperAdminShell` be refactored into the horizontal layout (breaking change) or should a new `HorizontalShell` be built alongside it (non-breaking, then `SuperAdminShell` deprecated)? The non-breaking path is safer.

3. **Chart wrappers in the library vs per-portal**: Should `RechartsBarChart` and `RechartsDonut` live in `@andikisha/ui` (requiring Recharts as a peer dependency, making it universally available) or in each portal's local `src/components/dashboard/` (as the dashboard spec currently places them)? If they land in the library, add Recharts as a peer dependency. If they stay portal-local, the library has no chart dependency. Recommend: library, because both portals will need charts.

---

*Phase 0 complete. Awaiting Lawrence's review before Phase 2.*
