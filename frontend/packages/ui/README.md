# @andikisha/ui

Shared component library for AndikishaHR. Consumed by `tenant-portal`, `platform-portal`, and `landing`.

## Three-tier model

Components are grouped into three tiers. The tier determines whether a component belongs in this package.

**Tier 1 — Primitives** (this package)  
Data-agnostic, zero business logic, no API calls. Reusable across all three apps.  
Examples: `Button`, `Badge`, `DataTable`, `DonutChart`, `PermissionGate`, `HorizontalShell`

**Tier 2 — Patterns / Chrome** (this package)  
Composed from Tier 1, may know about roles and navigation structure, but no domain data.  
Examples: `TenantAdminShell`, `EmployeeShell`, `ProfileMenu`, `CommandPalette`

**Tier 3 — Domain-coupled** (in the app, not here)  
Knows about API shapes, business rules, or specific tenant data. Must not live in `@andikisha/ui`.  
Examples: `PayslipRow`, `LeaveRequestCard`, `EmployeeStatusChip`

## Token system

### Colors

Brand palette: `brand-50` → `brand-950`, `amber`, `amber-dark`, `amber-light`, `surface`, `surface-alt`, `near-black`, `whatsapp`, `error`

Neutral scale: `neutral-50` → `neutral-900`

| Token | Hex | Use |
|---|---|---|
| `neutral-900` | `#111111` | Primary text on light |
| `neutral-700` | `#374151` | Body copy |
| `neutral-500` | `#6b7280` | Secondary / muted |
| `neutral-400` | `#9ca3af` | Placeholder, disabled labels |
| `neutral-300` | `#d1d5db` | Dividers |
| `neutral-200` | `#e5e7eb` | Borders, card outlines |
| `neutral-100` | `#f3f4f6` | Subtle backgrounds |
| `neutral-50`  | `#fafafa`  | Page canvas |

### Typography

Font: Roboto (`--font-roboto`). Loaded by each app's `layout.tsx` via `next/font/google`.  
Utilities: `font-display`, `font-body` → both resolve to `var(--font-roboto)`.  
Mono: `font-mono` → `var(--font-dm-mono)` (for numeric displays).

### Tailwind preset

Extend your app's Tailwind v3 config with the preset:

```ts
import uiPreset from "@andikisha/ui/tailwind-preset";
export default { presets: [uiPreset], content: [...] };
```

For Tailwind v4 apps, copy the `@theme` block from `tenant-portal/src/app/globals.css`.

## Shells

| Shell | Layout | Surface |
|---|---|---|
| `HorizontalShell` | Fixed 56 px top bar + full-width content | SUPER_ADMIN (platform-portal) |
| `TenantAdminShell` | Left sidebar + content | ADMIN, HR_MANAGER, PAYROLL_OFFICER |
| `EmployeeShell` | Bottom nav rail + content | EMPLOYEE, LINE_MANAGER |
| `SuperAdminShell` | **@deprecated** — use `HorizontalShell` | — |

## Charts

All charts are Tier 1 wrappers around recharts. Add `recharts` to the consuming app's dependencies.

| Component | Use |
|---|---|
| `DonutChart` | Circular progress / leave balance / attendance split |
| `BarChart` | Payroll trend, monthly aggregates |
| `LineChart` | Headcount over time, attendance trends |

## Role / permission system

```tsx
// Wrap layout.tsx with the provider (reads tenant_token cookie)
<CurrentUserProvider>...</CurrentUserProvider>

// Gate UI sections by role
<PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
  <RunPayrollButton />
</PermissionGate>

// Hooks
const user = useCurrentUser();         // CurrentUser | null
const ok   = useHasRole("ADMIN");      // boolean
const auth = useIsAuthenticated();     // boolean
```

## Commands

```bash
pnpm --filter @andikisha/ui type-check   # TypeScript
pnpm --filter @andikisha/ui test         # Vitest (unit)
pnpm --filter @andikisha/ui test:watch   # Watch mode
```
