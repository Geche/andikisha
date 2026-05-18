# Platform-Portal Dashboard — Design Document

**Scope:** `/dashboard` in `frontend/platform-portal/` only. Other platform-portal surfaces are out of scope.

---

## Audit Findings — HorizontalShell and Current Dashboard Stub

These are concrete problems found in the code, not aesthetic preferences.

### Finding 1 — PageHeader rendered inside a padding wrapper (structural bug)

`(platform)/layout.tsx` wraps all children in `<div className="px-6 py-6">`. The `PageHeader` component has `px-8` and a `border-b` that is meant to span the full content-area width. When PageHeader renders inside the `px-6 py-6` div, the border-b is inset 24px on each side and the title is visually floating, not anchored to the left edge. This breaks the visual pattern every other page in both portals uses (border-b spans full width, content below is padded separately).

**Fix required:** Remove the `px-6 py-6` wrapper from `(platform)/layout.tsx`. Let each page manage its own content padding, exactly as tenant-portal pages do.

### Finding 2 — Horizontal nav overflows at 1280–1440px viewports

The nav config has 11 top-level items, most with icons and dropdown chevrons. Measured estimate per item: `px-3` × 2 (24px) + icon (15px) + gap (6px) + label width (40–115px) + chevron (13px where applicable). Total nav width for all 11 items: approximately 1320px. Add logo area (≈141px) and ProfileMenu right slot (≈176px): the bar requires approximately 1637px minimum. Standard laptop screens are 1280–1440px wide. **The nav will not fit.** Items that overflow are either clipped or wrap, breaking the layout.

**Root cause:** Icons on horizontal nav items are a vertical-sidebar convention. Horizontal nav in the reference (and in every production horizontal-nav tool — Notion, Linear, Vercel) uses text-only items. Removing icons from the top-level `TopNavItem` reduces each item width to approximately 70–90px, bringing total nav width to approximately 1150px, which fits on a 1280px viewport with acceptable tightness.

**Fix required:** Remove `icon` rendering from `TopNavItem` in `HorizontalShell.tsx`. Icons remain available in the dropdown children where they aid scanability in the vertical list. The `HorizontalNavItem.icon` field stays on the type (mobile drawer still uses it). Only the desktop top-bar render drops the icon display.

### Finding 3 — Content-area padding uses px-6 py-6 instead of px-8 py-8

The layout wrapper uses `px-6 py-6`; tenant-portal pages use `px-8 py-8`. At the moment only one page exists in platform-portal so the divergence has no visible effect. Once the dashboard ships with real content, widget grids will misalign with the `PageHeader` title's `px-8` left edge. **Fix required:** Change layout wrapper to `px-8 py-8`, or remove the wrapper entirely and let pages control their own padding (preferred, matches tenant-portal pattern).

### Finding 4 — Active state: acceptable, no change needed

`border-b-2 border-b-brand-900 text-neutral-900` on the active item is visible, clear, and consistent with common horizontal-nav patterns. `-mb-px` correctly overlaps the bar's bottom border. No regression needed.

### Finding 5 — Right slot: acceptable, no change needed

ProfileMenu only. Correct for an internal ops tool. No notification bell exists yet; adding one is future work. Current state is clean, not empty.

### Finding 6 — Mobile collapse: present and functional

The hamburger-to-drawer pattern is implemented correctly. The drawer shows the same nav items in a vertical list with icons (appropriate in a drawer). Platform-portal is desktop-primary; mobile nav is a safety net, not a primary target. No changes required.

### Template comparison (layout-horizontal.html)

The SmartHR template uses Bootstrap's horizontal nav with: search bar in the topbar, dropdown modules (CRM, notifications, language picker), and a user profile section. Key structural choices in HorizontalShell that diverge deliberately:
- No search bar (correct for an ops tool with a known, small user base)
- No notification bell (deferred, correct)
- Template uses Bootstrap classes and Feather icons — these are forbidden dependencies; the structural reference is the nav topology, not the code
- Template items are text-only (no icons in the horizontal bar itself) — this confirms Finding 2: remove icons from top-bar items

---

## A. User Context

The SUPER_ADMIN is an Andikisha employee. The population is small (≤5 people). This is not a product the customer sees — it is an ops tool for the team running the platform.

**Job-to-be-done on dashboard load:** "What's happening on the platform right now, and what needs my attention?"

This decomposes into three sub-questions asked in order:
1. Is the platform healthy? (Anything on fire before I do anything else?)
2. How are tenants growing? (Any new signups overnight? Trials about to expire?)
3. Is revenue tracking as expected? (Is MRR moving in the right direction?)

The dashboard must answer these three questions in the order they're asked. Platform health is highest urgency and should be the first thing the eye lands on, or clearly accessible with no scrolling.

**Usage pattern:** Opened at the start of the day. Occasionally opened to investigate a specific concern (service down, tenant complaint). Sessions are short and task-oriented. The SUPER_ADMIN is technical — no need to hide jargon or simplify concepts.

---

## B. Information Hierarchy

Ranked by "what does the SUPER_ADMIN need first":

1. **Platform health** — blocking; if services are down, nothing else matters
2. **Active tenants** — primary business KPI
3. **Trials expiring** — time-sensitive action item (trials that expire unconverted = lost revenue)
4. **MRR** — financial health indicator
5. **Recent tenant signups** — context for tenant conversations, recent activity
6. **Support tickets** — queue status (hidden until support feature ships)

---

## C. Widget Inventory

### Widget 1 — Active Tenants KPI

**Purpose:** Core growth metric. Total tenants currently in ACTIVE status.

**Layout position:** KPI strip, column 1 of 3.

**Backend:** `GET /api/v1/super-admin/tenants/metrics` → `DashboardMetricsResponse.active` and `DashboardMetricsResponse.activeDelta` (month-to-date new active tenants). **LIKELY_EXISTS** — `SuperAdminTenantService.getDashboardMetrics()` returns exactly these fields. Verify controller route.

**Display:**
- Value: active tenant count as integer
- Sub-label: `+{activeDelta} this month`
- Click: navigates to `/tenants`

**If removed:** Lose the primary business KPI. Not removable.

**If endpoint missing:** Show skeleton loader indefinitely; add `InlineAlert` with "Metrics unavailable" if error persists >3s.

---

### Widget 2 — Trials Expiring KPI

**Purpose:** Action trigger. Trials expiring soon = potential revenue at risk.

**Layout position:** KPI strip, column 2 of 3.

**Backend:** Same `GET /api/v1/super-admin/tenants/metrics` → `DashboardMetricsResponse.trialsExpiring7` (expiring in 7 days). **LIKELY_EXISTS** — same endpoint as Widget 1.

**Display:**
- Value: count of trials expiring within 7 days
- Sub-label: `{trialsExpiring48} expiring in 48h`
- Amber highlight (`bg-amber-light border-amber`) when `trialsExpiring48 > 0`
- Click: navigates to `/tenants?status=TRIAL`

**If removed:** No visibility into trials at risk. Not removable.

**If zero:** Show `0` with neutral styling (no amber). Correct state — green ops.

---

### Widget 3 — MRR KPI

**Purpose:** Financial health. Monthly recurring revenue as the primary revenue signal.

**Layout position:** KPI strip, column 3 of 3.

**Backend:** `GET /api/v1/super-admin/billing/mrr` → `{ mrr: number, mrrDelta: number, currency: "KES" }`. **NEEDS_BACKEND.** No billing aggregation endpoint exists. `tenant-service` has licence rows with `agreedPriceKes` and `billingCycle` — MRR can be derived from summing active licences normalized to monthly. This is new logic.

**Display:**
- Value: `KES {mrr}` formatted with `MoneyAmount` component
- Sub-label: month-over-month change (positive/negative badge)
- Click: navigates to `/billing`

**If endpoint missing:** Render widget with `—` and sub-label "Revenue data unavailable". Do not block other widgets.

**If removed:** Lose financial visibility. Acceptable as a V1 omission if backend is not ready.

---

### Widget 4 — Recent Tenant Signups Table

**Purpose:** Context panel. Who signed up recently? Enables the SUPER_ADMIN to greet new tenants, trigger onboarding calls, spot anomalies.

**Layout position:** Lower section, left column (spans ~60% width).

**Backend:** `GET /api/v1/super-admin/tenants?size=10&sort=createdAt,desc` → paginated `TenantSummaryResponse`. **LIKELY_EXISTS** — `SuperAdminTenantService.listTenants(pageable)` is implemented.

**Columns:** Company name | Plan | Status (badge) | Created date | Admin email (truncated)

**Row click:** Navigates to `/tenants/{id}`. Detail page does not exist yet — link renders but destination is a stub. This is noted; the table still ships.

**Empty state:** "No tenants yet. Provision the first tenant to get started." with a button linking to `/tenants/new`.

**If removed:** Lose recency context. Acceptable; dashboard still functions with 3 KPIs + health grid.

---

### Widget 5 — Platform Health Grid

**Purpose:** Ops safety net. Answers "is anything on fire?" before the SUPER_ADMIN starts other work.

**Layout position:** Lower section, right column (spans ~40% width). Intentionally placed second in the lower row; reading order is left-to-right (recent signups, then health check).

Wait — the information hierarchy (Section B) places platform health first. This is a conflict. Resolution: health grid goes in the **top row of the lower section** (above recent signups in a stacked layout), or moves to a visual indicator in the top bar. Proposal: **health grid anchors the right column at the top, at the same vertical position as the recent signups table**. SUPER_ADMIN sees both simultaneously on a typical desktop viewport — health on the right, signups on the left. Health is visually prominent because its compact grid shape draws the eye more efficiently than a text table.

**Backend:** `GET /api/v1/super-admin/system/health` → `{ services: [{ name, status: "UP"|"DEGRADED"|"DOWN", latency?: number }] }`. **NEEDS_BACKEND.** Each Spring Boot service exposes `/actuator/health`. A new endpoint in `tenant-service` (or a dedicated `system-service`) must aggregate these. 13 services × 1 HTTP call each = parallel health checks.

**Display:** Grid of service name + status dot. Green (`bg-brand-500`), amber (`bg-amber`), red (`bg-error`). No latency numbers in V1 — just UP/DOWN/DEGRADED. Click on any service navigates to `/system/health`.

**If endpoint missing:** Show 13 grey dots with label "Health unavailable". Never block render.

**If removed:** Loss of visibility is significant for an ops tool. Not recommended to remove; deferring backend is acceptable, shipping placeholder UI is correct.

---

### Widget 6 — Active Support Tickets

**Purpose:** Queue awareness. How many tenants are waiting for a response?

**Status:** **HIDDEN** until support feature is built. The `/support` surface does not exist. No backend endpoint exists. Rendering a broken or zero-state widget for a feature that isn't live creates confusion. Widget is omitted from V1.

When support ships: render as a compact count card in the KPI strip (would become a 4th KPI, adjusting grid from 3-col to 4-col) or in the lower section as a table of open tickets.

---

## D. Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HorizontalShell — 56px fixed top bar                        │
│  Logo | Dashboard Tenants Billing ... Settings | ProfileMenu │
├──────────────────────────────────────────────────────────────┤
│  PageHeader — "Platform Dashboard" (flush, full-width)       │
│  No subtitle. No actions (read-only dashboard, no CTA here). │
├──────────────────────────────────────────────────────────────┤
│  Content area — px-8 py-8                                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Widget 1 │  │ Widget 2 │  │ Widget 3 │                   │
│  │ Active   │  │ Trials   │  │   MRR    │                   │
│  │ Tenants  │  │Expiring  │  │  KES —   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│  ┌───────────────────────────┐  ┌────────────────┐          │
│  │  Widget 4                 │  │  Widget 5      │          │
│  │  Recent Tenant Signups    │  │  Platform      │          │
│  │  Table (last 10)          │  │  Health Grid   │          │
│  │                           │  │                │          │
│  │                           │  │  ● api-gateway │          │
│  │                           │  │  ● auth-svc    │          │
│  │                           │  │  ● employee    │          │
│  │                           │  │  ...13 total   │          │
│  └───────────────────────────┘  └────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

**KPI strip:** `KpiGroup cols={3}` — reuses existing primitive directly.

**Lower section:** Two-column CSS grid. Left: `col-span-5` (≈60%). Right: `col-span-3` (≈40%). On screens <1024px, both collapse to full width stacked. Use `grid grid-cols-8 gap-6` at `lg:`, single column below.

**No chart in V1.** A tenant growth chart (similar to the tenant-portal payroll trend chart) is the natural next addition, but it requires the `getTenantGrowth` endpoint to be wired to a frontend component. Deferred to V2. V1 prioritizes correctness over completeness.

**No actions in PageHeader.** The dashboard is read-only. "Provision Tenant" is in the Tenants nav dropdown. Adding a CTA button here would duplicate navigation.

---

## E. Visual Language

**No divergence from tenant-portal.** Token rules:

| Element | Token | Same as tenant-portal? |
|---------|-------|------------------------|
| KPI card background | `bg-surface border-neutral-200` | ✅ |
| KPI label | `text-[12px] font-semibold uppercase tracking-wide text-neutral-500` | ✅ |
| KPI value | `text-[28px] font-bold text-near-black` | ✅ |
| Table container | `bg-surface border-neutral-200 rounded-xl` | ✅ |
| Status badge (active) | `Badge status="approved"` | ✅ |
| Status badge (trial) | `Badge status="calculating"` | ✅ |
| Status badge (suspended) | `Badge status="cancelled"` | ✅ |
| Health dot — UP | `w-2 h-2 rounded-full bg-brand-500` | new |
| Health dot — DEGRADED | `w-2 h-2 rounded-full bg-amber` | new |
| Health dot — DOWN | `w-2 h-2 rounded-full bg-error` | new |
| Amber KPI card highlight | `border-amber bg-amber-light` | ✅ |
| Content area padding | `px-8 py-8` | ✅ (after fix) |
| Font | Roboto (already set in layout.tsx) | ✅ |

**No raw hex. No `gray-*` classes. No new color tokens.** The health dots use existing tokens (`brand-500`, `amber`, `error`).

**Typography scale unchanged** — all text sizes follow the same `text-[13px]`/`text-[14px]`/`text-[28px]` pattern as tenant-portal components.

---

## F. Interaction Patterns

**Clickable areas:**
- Widget 1 (Active Tenants): entire card → `/tenants`
- Widget 2 (Trials): entire card → `/tenants?status=TRIAL`
- Widget 3 (MRR): entire card → `/billing`
- Widget 4 (Recent Signups): each row → `/tenants/{id}` (stub destination, acceptable)
- Widget 5 (Health Grid): entire grid → `/system/health`; individual service row → `/system/health#{service}`

**Loading states:**
- KPI widgets: `StatCard` renders with `value="—"` and `sub=""` while loading. No skeleton shimmer needed for a simple number — the text replacement is sufficient and matches existing tenant-portal pattern.
- Table: `DataTable` has `isLoading` prop that renders row skeletons. Use this.
- Health grid: render all 13 service rows with grey dots while loading.

**Error states:**
- Each widget handles its own error independently. An error in the health grid does not affect the KPI strip.
- KPI error: replace value with `"—"`, show `text-[12px] text-neutral-400` sub-label "Unavailable".
- Table error: render `InlineAlert variant="error"` inside the card.
- Health grid error: render all dots grey with "Health data unavailable" in `text-[12px] text-neutral-400`.

**Empty state (new platform, zero tenants):**
- Widgets 1–3: show `0` with correct sub-labels. No special treatment.
- Widget 4 table: show empty state message "No tenants yet. Provision the first tenant." with a text link to `/tenants/new`.
- Widget 5: render dots normally (all services should be UP even with no tenants).

**No refresh button on dashboard.** React Query's `staleTime` default handles re-fetching. Stale time for KPIs and health: 30 seconds. Stale time for recent signups table: 60 seconds.

---

## G. Design Decisions and Rationale

1. **Icons removed from top-level horizontal nav items.** The nav has 11 items. With icons, the bar overflows at 1280–1440px. Horizontal nav is a text-primary pattern; icons belong in vertical sidebar nav and dropdown lists. The icon field stays on the type and is used in the mobile drawer.

2. **PageHeader wrapper removed from layout.tsx.** PageHeader must render flush to the content area edge. Each page controls its own content padding, matching the tenant-portal pattern.

3. **Content padding standardized to px-8 py-8.** Matches tenant-portal. Eliminates visual inconsistency when users (during demos or internal use) have both portals open.

4. **Three-column KPI strip, not four.** MRR (Widget 3) needs a new backend endpoint and may ship later. A 3-col strip gracefully degrades when MRR is unavailable (Widget 3 shows `—`). A 4-col strip with support tickets would require the support feature to ship, which it hasn't.

5. **Platform health goes in the right column of the lower section, not the top row.** Information hierarchy puts health first, but a 2-column layout lets the SUPER_ADMIN see health and recent signups simultaneously without scrolling. The compact dot-grid draws the eye faster than reading a table, so it effectively has higher visual priority even at the same vertical position.

6. **No growth chart in V1.** Adds complexity; the KPIs already show `activeDelta`. Chart is the right V2 addition once the team confirms the dashboard is useful.

7. **Support widget hidden, not "coming soon".** A disabled widget with a lock icon or placeholder text is noise for a tool used by ≤5 people. When support ships, the widget appears. Before that, it doesn't exist.

8. **MRR widget ships in V1 with a degraded state if the backend isn't ready.** The frontend component ships complete. The backend gap is documented. The SUPER_ADMIN sees `—` until the endpoint is built. This is better than skipping the widget, which would require re-layout when MRR lands.

9. **Recent signups table shows last 10 rows, no pagination.** This is a "glance" surface, not a full tenant list. Full pagination lives at `/tenants`.

10. **Health grid shows all 13 services.** Omitting any service creates a false sense of health. If a service isn't in the response, its dot renders grey (unknown), not omitted.

11. **No subtitle in PageHeader.** "AndikishaHR internal platform overview" (current stub text) is redundant — the SUPER_ADMIN knows what they're looking at. Subtitle space is reserved for a live timestamp or "Last updated: {time}" if we add auto-refresh indicators later.

12. **No CTA in PageHeader.** "Provision Tenant" is in the Tenants dropdown nav. Adding it to the dashboard header duplicates navigation and implies the dashboard's purpose is provisioning, which it isn't.

13. **Widget cards are clickable wholes, not just the title.** Clicking anywhere on the KPI card navigates. This matches the tenant-portal stat card pattern.

14. **DataTable used for recent signups, not a custom list.** The existing `DataTable` primitive handles loading, empty, and row-click states. No new component needed.

15. **Health dots are native CSS, no new component.** A `<span className="w-2 h-2 rounded-full bg-brand-500" />` is sufficient. If a `StatusDot` primitive is later needed across multiple surfaces, it gets extracted then. Not now.

---

## H. Open Questions

1. **MRR calculation method.** Is MRR derived from `TenantLicence.agreedPriceKes × (1 if monthly, ÷ 12 if annual)` for active licences only? Or is it based on actual payments received (requires M-Pesa reconciliation)? This affects what the endpoint aggregates and whether the number is "contracted MRR" vs "collected MRR". **Decision needed before building the backend.**

2. **Health endpoint ownership.** Which service builds `GET /api/v1/super-admin/system/health`? It needs to make parallel HTTP calls to 13 `actuator/health` endpoints. Does it live in `tenant-service` (the platform-facing service) or in a new `system-service`? Or does api-gateway expose a composite health endpoint? **Decision needed before building the backend.**

3. **Tenant detail page.** Widget 4 (recent signups) rows link to `/tenants/{id}`. That page is a stub. Should the table rows be non-clickable until the detail page ships, or should they link to a stub with the right URL now? Recommendation: link to the URL now. Stubs are acceptable during development.

4. **Trial widget threshold.** The design shows "trials expiring in 7 days" as the primary number, with "expiring in 48h" as sub-label. Is 7 days the right primary window, or should it be 14 days (one renewal cycle for monthly plans)? The backend already computes both `trialsExpiring7` and `trialsExpiring48`. The question is which one leads.

5. **Health dot granularity.** Three states (UP / DEGRADED / DOWN) cover the common cases. Should DEGRADED be defined as "health check returned UP but latency > threshold" or "Spring Boot reports `OUT_OF_SERVICE`"? If latency tracking is needed, the backend health endpoint needs to measure response time, not just status. **Decision affects backend implementation.**

6. **Auto-refresh.** Should the health grid auto-refresh every 30 seconds without user interaction? This is standard for ops dashboards. React Query's `refetchInterval` handles it. But it adds background network traffic. For ≤5 users, this is negligible. Decision: **yes, auto-refresh health grid every 30s, KPIs every 60s.** Flagged here for Lawrence to confirm or override.

---

## Chrome Refinements Required

These changes to `HorizontalShell.tsx` and `(platform)/layout.tsx` are documented here and will be implemented when the dashboard ships.

### Refinement 1 — Remove icon rendering from `TopNavItem` (desktop top bar only)

In `HorizontalShell.tsx`, the `TopNavItem` component and the `Link` variant both render `{Icon && <Icon size={15} strokeWidth={1.75} />}`. Remove this from both render paths. The `icon` prop on `HorizontalNavItem` remains (used in mobile drawer). No API change, no prop deletion — only the desktop render changes.

**Effect:** Nav items are text-only on desktop. Nav fits within 1280px viewport. Mobile drawer is unaffected (icons still render in `MobileNav`).

### Refinement 2 — Remove `<div className="px-6 py-6">` wrapper from `(platform)/layout.tsx`

```tsx
// Before:
<HorizontalShell navItems={platformNavConfig} rightSlot={rightSlot}>
  <div className="px-6 py-6">
    {children}
  </div>
</HorizontalShell>

// After:
<HorizontalShell navItems={platformNavConfig} rightSlot={rightSlot}>
  {children}
</HorizontalShell>
```

Each page is responsible for its own content padding. The dashboard page will use `<div className="px-8 py-8">` after the `PageHeader`.

**Effect:** PageHeader renders flush and full-width. Border-b spans the content area. Consistent with tenant-portal.

### Refinement 3 — Remove subtitle from current dashboard PageHeader stub

The current stub has `subtitle="AndikishaHR internal platform overview"`. Replace with no subtitle (omit the prop). The title "Platform Dashboard" is sufficient.

### No other HorizontalShell changes required.

The active state treatment, mobile drawer, right slot, and logo placement are all acceptable as-is.

---

## New Primitives Required

One new primitive is proposed but not yet built:

**`ServiceHealthGrid`** — a grid of service name + status dot rows. Props: `services: { name: string; status: "UP" | "DEGRADED" | "DOWN" | "UNKNOWN" }[]`, `isLoading: boolean`, `onServiceClick?: (name: string) => void`. This lives in `@andikisha/ui` if it's reused across platform-portal surfaces; otherwise it lives directly in `platform-portal/src/components/`. Given only the dashboard uses it in V1, build it in-app. Extract to `@andikisha/ui` if it appears elsewhere.

No other new primitives needed. Widget 4 uses `DataTable`, Widgets 1–3 use `StatCard` inside `KpiGroup`, Widget 5 uses the inline `ServiceHealthGrid`. `PageHeader` and `Badge` already exist.

---

## Backend Gaps Summary

| Widget | Endpoint | Status |
|--------|----------|--------|
| W1 Active Tenants KPI | `GET /api/v1/super-admin/tenants/metrics` | LIKELY_EXISTS — verify |
| W2 Trials Expiring KPI | Same endpoint | LIKELY_EXISTS — verify |
| W3 MRR KPI | `GET /api/v1/super-admin/billing/mrr` | NEEDS_BACKEND |
| W4 Recent Signups Table | `GET /api/v1/super-admin/tenants?size=10&sort=createdAt,desc` | LIKELY_EXISTS — verify |
| W5 Platform Health Grid | `GET /api/v1/super-admin/system/health` | NEEDS_BACKEND |
| W6 Support Tickets | Hidden in V1 | N/A |

"LIKELY_EXISTS" means the service method is implemented (`SuperAdminTenantService`) but the controller endpoint has not been verified in this audit. Confirm before frontend wiring.
