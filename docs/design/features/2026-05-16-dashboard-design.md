# AndikishaHR Dashboard Design Document

**Date:** 2026-05-16  
**Author:** Design phase — no code produced  
**Covers:** Admin dashboard (`/admin/dashboard`) and Employee dashboard (`/my/dashboard`)  
**Target viewport:** 1366×768 (common Kenyan SME laptop); mobile-first for employee surface  

---

## Baseline: What Exists Today

### Admin dashboard (`/admin/dashboard`)

Currently renders four widgets:

1. **KPI strip** — 4 `StatCard` instances via `KpiGroup cols={4}`: Total Employees (from `GET /api/v1/employees?size=1`, reads `totalElements`), Pending Leave (from `GET /api/v1/leave/requests?status=PENDING&size=1`), Latest Net Payroll (from `GET /api/v1/payroll/runs?size=12`), Last Run Status (same payroll query).
2. **Payroll trend bar chart** — `BarChart` showing net payroll by calendar month, period-switchable tabs (30 days / 3 / 6 / 12 months), driven by the same payroll runs list.
3. **Recent Payroll Runs table** — `DataTable` showing last 7 runs. Clickable rows navigate to `/admin/payroll/{id}`.
4. **`PageHeader`** — title "Dashboard", live date/time subtitle EAT, "Export report" (outline) and "+ Run Payroll" (CTA) action buttons.

Issues in the current implementation:
- "Export report" button calls `refetchEmp/refetchLeave/refetchPayroll` instead of triggering an export. The label is wrong and the action is wrong.
- The payroll trend period tabs (30 days / 3 / 6 / 12 months) are wired to `chartPeriod` state but `buildPayrollChartData` ignores `chartPeriod` and always uses the full 12-run payload. The filter is cosmetic only.
- The 4th KPI card ("Last run status") is a badge inside a `StatCard` — the visual result is awkward because `StatCard` renders a `text-[28px]` value slot that holds a small badge.
- There is no widget for leave approvals that enables action from the dashboard (the KPI shows a count but clicking it does nothing).
- Attendance data is not present even though `GET /api/v1/attendance/daily?date=` exists on the backend.

### Employee dashboard (`/my/dashboard`)

Currently renders three widget zones:

1. **Metric row** — 4 inline `MetricCard` components (local, not from `@andikisha/ui`): Annual Leave balance, Sick Leave balance, Latest Net Pay, Pending Requests.
2. **Recent Payslips** — inline `<table>` showing last 3 payslips from `GET /api/v1/payroll/employees/{employeeId}/payslips?size=3`. Rows are not clickable (no navigation to `/my/payslips/{id}`).
3. **Leave Requests** — inline `<table>` showing last 5 requests from `GET /api/v1/leave/employees/{employeeId}/requests?size=5`. Rows are not clickable.

Issues:
- `MetricCard` is a local component that duplicates `StatCard` from `@andikisha/ui`. It uses `bg-white` (raw token gap — should be `bg-surface`) and `text-neutral-900` (acceptable). The component should be replaced with `StatCard`.
- The payslip table does not use `DataTable` from `@andikisha/ui`.
- Neither payslip rows nor leave rows are clickable, leaving the dashboard as a read-only report rather than a navigation hub.
- No quick-action for applying for leave from the dashboard.
- LINE_MANAGER users see the identical view as EMPLOYEE; there is no team section.

---

## Section A: User Context

### A1. Admin Dashboard

**Who:** HR Manager, Payroll Officer, or Tenant Admin. Typically 1–3 people in a Kenyan SME of 20–200 employees. Comfort with spreadsheets but not necessarily with SaaS products. Often the same person who handles payroll, leave approvals, and onboarding.

**Typical session pattern:** Opens the dashboard at the start of the day or after a payroll run to confirm status, then navigates directly to Payroll or Leave. Does not linger on the dashboard — it is a dispatch point. Returns mid-month to check pending leave count before approving in bulk.

**Primary job-to-be-done:** "Is everything okay right now, and what do I need to act on today?"

**Top 3 questions they bring to this dashboard:**
1. Did last month's payroll complete successfully? What was the net total?
2. How many leave requests are waiting for my approval?
3. How many active employees are on the books this period?

**Top 3 actions they take most frequently:**
1. Navigate to `/admin/payroll` to review or initiate a payroll run.
2. Navigate to `/admin/leave` to approve or reject pending leave requests.
3. Run a new payroll (`/admin/payroll/new`).

---

### A2. Employee Dashboard

**Who:** Kenyan employee, any level, typically 22–45 years old. May use the app on a personal Android phone over a mobile data connection, not necessarily on a laptop. Leave balance is the top concern — Kenyan workers track annual leave carefully because unused leave entitlements can expire or be contested. Payslip access is the second most common reason to open the app.

**Typical session pattern:** Opens 1–3× per month. Most common trigger: payday (to check net pay), before submitting a leave request (to check balance), or after submitting a request (to check approval status). Sessions are short — under 2 minutes — and goal-directed.

**Primary job-to-be-done for EMPLOYEE:** "How many leave days do I have left, and did my latest payslip land?"

**Primary job-to-be-done for LINE_MANAGER:** Above, plus: "Do any of my team's leave requests need my action today?"

**Top 3 questions they bring to this dashboard:**
1. How many annual leave days do I have remaining?
2. What was my last net pay?
3. Did my leave request get approved?

**Top 3 actions they take most frequently:**
1. Check leave balances, then navigate to `/my/leave` to apply.
2. Check latest payslip, then navigate to `/my/payslips` to download.
3. Check status of a pending leave request.

---

## Section B: Information Hierarchy

### B1. Admin Dashboard

**Single most important piece of information:** Latest payroll run status. An admin who has just processed payroll returns primarily to confirm it completed. A FAILED status demands immediate action. A COMPLETED status is a green light to move on.

**Ranked information hierarchy:**

| Rank | Information | Justification |
|------|-------------|---------------|
| 1 | Latest payroll run status + net total | Admins return primarily to confirm payroll completed cleanly |
| 2 | Pending leave request count | Requires action; blocking for employees; a non-zero count demands a response |
| 3 | Active employee headcount | Context for all other numbers; flags unexpected changes |
| 4 | Payroll cost trend (last 6–12 months) | Identifies anomalies; month-on-month variance is CFO-facing |
| 5 | Recent payroll runs list | Operational log; entry point to run detail pages |
| 6 | Today's attendance summary | Contextual; present only if attendance data is available; supports workforce visibility |

**Deliberately excluded and why:**
- **Department breakdown donut chart** — meaningful at 100+ employees but misleading for tenants with 10–30 staff where one department dominates. Deferred to analytics-service Phase 4.
- **Top performer widget** (seen in SmartHR template) — not a concept in AndikishaHR Phase 1–2; requires performance-service (Phase 4).
- **Recruitment widget** — recruitment-service not in scope for MVP phases 1–2.
- **Live clock-in feed** (SmartHR template) — useful but requires attendance websocket or aggressive polling; deferred.
- **Payroll by employee breakdown** — too granular for a dashboard; belongs on the run detail page at `/admin/payroll/{runId}`.
- **Earnings vs expenses financial widgets** — AndikishaHR does not have a general ledger; this is payroll-specific, not accounting.

---

### B2. Employee Dashboard

**Single most important piece of information:** Annual leave balance. Employees check this more frequently than payslips; it drives the decision to submit a leave request.

**Ranked information hierarchy:**

| Rank | Information | Justification |
|------|-------------|---------------|
| 1 | Annual leave balance (days remaining) | Most frequent check; drives leave application |
| 2 | Sick leave balance | Secondary balance; often checked together with annual |
| 3 | Latest net pay + period | Payday confirmation; employees check this monthly |
| 4 | Pending leave request status | Anxiety-reducing; employee wants to know if their request moved |
| 5 | Recent payslips list (last 3) | Entry point to download/view payslip |
| 6 | Recent leave requests list (last 5) | Status visibility across the last few requests |
| 7 | LINE_MANAGER team queue (conditional) | Only renders when `LINE_MANAGER` role is present |

**Deliberately excluded and why:**
- **Attendance clock-in widget** — clock-in/out is better as a dedicated mobile action (not a dashboard widget); attendance service endpoints require `X-Employee-ID` header which must be available; deferred pending PWA clock-in feature.
- **Pay breakdown / PAYE detail** — too granular for dashboard; belongs on the payslip detail page.
- **Training or documents widgets** — document-service is Phase 3; not available at MVP.
- **Birthday / work anniversary widget** — cute but drives no action; excluded.
- **Notification feed** — pending notification-service (Phase 3).

---

## Section C: Widget Inventory

### C1. Admin Dashboard Widgets

---

**Widget: Latest Payroll Run Hero**

- **What it shows:** The most recent payroll run — status badge, period (e.g. "April 2026"), total net pay, employee count, frequency.
- **Backend endpoint:** `GET /api/v1/payroll/runs?size=1&sort=createdAt,desc` — EXISTING. Returns the first item from the paginated list.
- **Position:** Primary — top-left, full width or spanning 2 of 4 KPI columns.
- **Action it drives:** If status is DRAFT or CALCULATED, the CTA changes to "Approve run" (links to `/admin/payroll/{id}`). If COMPLETED, the CTA becomes "View payslips". If FAILED, an amber warning banner prompts investigation.
- **What happens if removed:** Admins lose their first-glance confirmation that payroll is healthy. They must navigate to `/admin/payroll` on every session to check.

---

**Widget: Pending Leave Count**

- **What it shows:** Count of leave requests in PENDING status, as a large number with "awaiting approval" sub-label.
- **Backend endpoint:** `GET /api/v1/leave/requests?status=PENDING&size=1` — EXISTING. Uses `totalElements` from the page response.
- **Position:** Primary KPI — one of the 4 KPI strip cards.
- **Action it drives:** Clicking the card navigates to `/admin/leave?status=PENDING`. The count > 0 creates urgency. Count = 0 is a relaxed green state.
- **What happens if removed:** Admins have no at-a-glance signal of pending work. Employees waiting for approval get delayed.

---

**Widget: Active Employee Headcount**

- **What it shows:** Total active employee count. Sub-label shows "Active headcount".
- **Backend endpoint:** `GET /api/v1/employees?size=1&status=ACTIVE` — EXISTING (the `status` filter is supported by `EmployeeQueryService.findAll`). The current implementation omits the `status=ACTIVE` filter and counts all employees including terminated ones. This should be fixed.
- **Position:** Primary KPI — one of the 4 KPI strip cards.
- **Action it drives:** Clicking navigates to `/admin/employees`. Unexpected drops signal a data problem.
- **What happens if removed:** Context for all payroll totals is lost. "KES 1.2M net payroll" is meaningless without knowing it covers 47 employees.

---

**Widget: Payroll Cost Trend Chart**

- **What it shows:** Bar chart of total net payroll per month for the rolling 12 months. Current month bar highlighted in `brand-900`. Prior months in `brand-100`. Y-axis formatted as "1.2M" using the existing `yFormatter` pattern.
- **Backend endpoint:** `GET /api/v1/payroll/runs?size=24&sort=createdAt,desc` — EXISTING. The current implementation already does this but the period filter tabs are cosmetic only (bug documented in baseline section above). The redesign should either fix the filter or remove the period tabs until the endpoint supports date-range filtering.
- **Position:** Secondary — occupies full width below the KPI strip.
- **Action it drives:** Anomaly detection. A sudden spike or drop triggers investigation. "View all runs" link in the top-right corner links to `/admin/payroll`.
- **What happens if removed:** Payroll trend visibility drops entirely. Month-on-month comparison becomes a manual exercise.

---

**Widget: Recent Payroll Runs Table**

- **What it shows:** Last 7 payroll runs. Columns: Period, Frequency, Employees, Total Net, Status, Date. Rows are clickable, navigating to `/admin/payroll/{id}`.
- **Backend endpoint:** `GET /api/v1/payroll/runs?size=7&sort=createdAt,desc` — EXISTING. Can share the same query as the trend chart by requesting size=12 and slicing.
- **Position:** Secondary — below the trend chart, full width.
- **Action it drives:** Quick access to any recent run. Status column shows which runs need attention. Clicking a FAILED row goes directly to the run for investigation.
- **What happens if removed:** The dashboard becomes a pure summary view with no way to navigate to a specific run. Admins must go to `/admin/payroll` and search.

---

**Widget: Today's Attendance Snapshot** _(proposed, NEEDS_BACKEND)_

- **What it shows:** Summary of today's attendance — present count vs total active employees. Rendered as a simple `DonutChart` with a center label "X/Y present" where X is present and Y is active headcount.
- **Backend endpoint:** `GET /api/v1/attendance/daily?date={today}` — EXISTING on the backend (`getDailyAttendance`). However, the current response is a `Page<AttendanceResponse>` of individual records. The dashboard needs an aggregate count, not a list. **A new endpoint is required:** `GET /api/v1/attendance/daily/summary?date={today}` returning `{ present: int, absent: int, late: int, total: int }`. **NEEDS_BACKEND.**
- **Position:** Supporting — bottom row, 1-of-2 columns in a 2-column supporting row.
- **Action it drives:** Identifies days with abnormal absence. Links to `/admin/attendance` for full view.
- **What happens if removed:** Dashboard loses operational workforce visibility. SmartHR template's "Attendance Overview" card captures this use case well (reference: `template/smarthr-html/index.html`, the `col-xxl-4` Attendance Overview card).

---

**Widget: Leave Type Breakdown** _(proposed, NEEDS_BACKEND)_

- **What it shows:** Breakdown of pending/recent leave requests by type (Annual, Sick, Maternity, etc.) as a small count list, not a chart. E.g. "Annual: 4 | Sick: 2 | Maternity: 1".
- **Backend endpoint:** No aggregate endpoint exists. `GET /api/v1/leave/requests?status=PENDING` returns individual requests which the frontend must aggregate. For a small pending count this is acceptable (page through and count), but a dedicated aggregate endpoint would be cleaner. **NEEDS_BACKEND** for a proper aggregate.
- **Position:** Supporting — bottom row, 2-of-2 columns alongside Attendance Snapshot.
- **Action it drives:** Flags if a specific leave type is surging (e.g. sick leave spike may indicate illness outbreak). Links to `/admin/leave` filtered by type.
- **What happens if removed:** Leave type context is absent from dashboard. Pending count alone is less informative.

---

### C2. Employee Dashboard Widgets

---

**Widget: Annual Leave Balance**

- **What it shows:** Days remaining for ANNUAL leave type. Large number, "d" suffix (e.g. "18d"). Sub-label "Days remaining this year". Subtle `surface-tint` background with `border-success` border when balance > 5 (healthy), `amber-light` background with `amber` border when balance ≤ 5 (low).
- **Backend endpoint:** `GET /api/v1/leave/me/balances` — EXISTING. Filter client-side for `leaveType === 'ANNUAL'`.
- **Position:** Primary KPI — leading card in the 2×2 or 4-column KPI strip.
- **Action it drives:** Clicking opens `/my/leave/apply` (leave application form). The card should have a visible "Apply" link or button directly on it.
- **What happens if removed:** Employees must navigate to `/my/leave` on every visit just to check a number. The dashboard loses its primary value proposition for this user.

---

**Widget: Sick Leave Balance**

- **What it shows:** Days remaining for SICK leave type. Same treatment as annual but uses `neutral-100` background always (sick leave doesn't prompt proactive use).
- **Backend endpoint:** `GET /api/v1/leave/me/balances` — EXISTING (same query, client-side filter for `leaveType === 'SICK'`).
- **Position:** Primary KPI — second card.
- **Action it drives:** Informational. No direct CTA (employees don't apply sick leave in advance).
- **What happens if removed:** Sick balance disappears, but this is the second most common balance check. Employees navigate to `/my/leave` instead — friction added.

---

**Widget: Latest Net Pay**

- **What it shows:** Net pay amount for the most recent payslip. `MoneyAmount` component at `lg` size. Sub-label shows the period (e.g. "April 2026") and payment status badge.
- **Backend endpoint:** `GET /api/v1/payroll/employees/{employeeId}/payslips?size=1&sort=createdAt,desc` — EXISTING.
- **Position:** Primary KPI — third card.
- **Action it drives:** Clicking navigates to the full payslip at `/my/payslips/{id}`. This is the primary reason employees open payslip-related sessions.
- **What happens if removed:** Employees must navigate to `/my/payslips` for the number they check monthly. High-frequency check moved to a secondary page — friction added.

---

**Widget: Pending Leave Requests Count**

- **What it shows:** Count of the user's own leave requests in PENDING status. Renders "0" in a neutral state (grey) or "N" in `amber-text` on `amber-light` when N > 0.
- **Backend endpoint:** `GET /api/v1/leave/employees/{employeeId}/requests` — EXISTING. Client-side filter for `status === 'PENDING'`. Already done in current implementation.
- **Position:** Primary KPI — fourth card.
- **Action it drives:** Clicking navigates to `/my/leave` filtered to show pending requests. Anxiety-reducing when the number decreases (request approved/rejected).
- **What happens if removed:** Employees must navigate to `/my/leave` to check status. The dashboard stops answering "did my request get approved?" without a click.

---

**Widget: Recent Payslips List**

- **What it shows:** Last 3 payslips — period, net pay amount, status badge. Rows are clickable, navigating to `/my/payslips/{id}`. "View all" link to `/my/payslips`.
- **Backend endpoint:** `GET /api/v1/payroll/employees/{employeeId}/payslips?size=3&sort=createdAt,desc` — EXISTING.
- **Position:** Secondary — left column in the 2-column secondary row.
- **Action it drives:** Download or view a payslip. Primary entry point for payslip access.
- **What happens if removed:** Employees must navigate to `/my/payslips` for each payslip interaction. The dashboard becomes payslip-blind.

---

**Widget: Recent Leave Requests List**

- **What it shows:** Last 5 leave requests — leave type, date range, days count, status badge. Rows are clickable (proposed). "Apply + view all" link to `/my/leave`.
- **Backend endpoint:** `GET /api/v1/leave/employees/{employeeId}/requests?size=5&sort=createdAt,desc` — EXISTING.
- **Position:** Secondary — right column in the 2-column secondary row.
- **Action it drives:** Status visibility for recent requests. The clickable row should open a leave request detail view (which may not yet exist as a page — see open questions).
- **What happens if removed:** Status visibility drops. Employees cannot see at a glance whether their vacation request from 2 weeks ago was approved.

---

**Widget: Team Leave Queue (LINE_MANAGER only)**

- **What it shows:** For users with the LINE_MANAGER role: count of their team's pending leave requests, and the 3 most recent pending requests with employee name, leave type, date range, Approve/Reject buttons. Conditionally rendered — invisible to EMPLOYEE-only users.
- **Backend endpoint:** `GET /api/v1/leave/requests?status=PENDING` — EXISTING. However this returns all tenant pending requests, not just the LINE_MANAGER's reports. **NEEDS_BACKEND** — a filtered endpoint `GET /api/v1/leave/requests?status=PENDING&approverId={userId}` or team-scoped filter is required for LINE_MANAGER to see only their team.
- **Position:** Secondary — full-width section below the payslip/leave row, visible only when `LINE_MANAGER` role present.
- **Action it drives:** Approve or reject directly from dashboard without navigating to a separate page. This is the highest-value widget for LINE_MANAGERs.
- **What happens if removed:** LINE_MANAGERs must navigate to `/admin/leave` (but they don't have `/admin/*` access — they're on `/my/*`). Without this widget, LINE_MANAGERs have no self-service approval surface on the employee portal at all.

---

## Section D: Layout Structure

### D1. Admin Dashboard Layout

**Grid system:** 12-column conceptual grid. Practical breakpoints:
- Mobile (`< lg`): Single column, widgets stack vertically.
- Desktop (`lg+`, 1366px): Full two-zone layout: 240px sidebar + remaining main area (~1100px at 1366px).

**Widget grid within the main content area:**

```
Row 1: KPI Strip — 4 columns at lg+ (KpiGroup cols={4})
       → grid-cols-2 on sm, grid-cols-4 on lg+
       → Cards: Active Employees | Pending Leave | Latest Net Pay | Last Run Status
       [Height: ~110px per card including padding]

Row 2: Payroll Trend Chart — full width
       [Height: card ~240px total including header and BarChart at h-[160px]]

Row 3: Recent Payroll Runs Table — full width
       [Height: ~280px for 7 rows]

Row 4 (proposed): Supporting row — 2 columns, 50/50 split
       Left:  Attendance Snapshot (DonutChart)
       Right: Leave Type Breakdown (count list)
       [Height: ~220px]
```

**Above-the-fold content at 1366×768:**

Shell header is 73px. PageHeader is 73px. Remaining content area: 622px. With `px-8 py-8` (32px padding each side and top), available content height above fold: ~558px.

Row 1 (KPI strip at ~110px) + Row 2 (trend chart at ~240px) = 350px + gaps (24px × 2 = 48px) + py-8 top = 32+350+48 = 430px. Both rows fit above fold. The start of Row 3 (Recent Runs table header) should be visible, inviting scroll. Row 4 (supporting widgets) is below fold — intentional, as they are lower priority.

**Reading order:** F-pattern. Eyes scan the KPI strip left-to-right for numbers, then drop to the chart for trend context, then down to the table for operational detail.

**Mobile collapse pattern:** KPI strip collapses to `grid-cols-2` (2×2 grid). Chart reduces to height `h-[120px]`. Table scrolls horizontally. Supporting row stacks vertically. The `EmployeeShell` bottom nav is not used for admin — `TenantAdminShell` has no mobile bottom nav; admin portal is desktop-primary.

---

### D2. Employee Dashboard Layout

**Grid system:** Tailwind responsive grid. `EmployeeShell` provides mobile-first chrome with `MobileBottomNav` (5 items) at bottom on mobile, left rail on `lg+`.

**Widget grid within the main content area:**

```
Row 1: KPI Strip — 4 cards
       → grid-cols-2 on mobile (2×2)
       → grid-cols-4 on lg+
       Cards: Annual Leave | Sick Leave | Latest Net Pay | Pending Requests
       [Height mobile: ~200px for 2 rows of cards; desktop: ~110px]

Row 2: Split row — 2 columns on lg+, stacked on mobile
       Left (lg: col-span-1):  Recent Payslips list
       Right (lg: col-span-1): Recent Leave Requests list
       [Height: ~240px each, matching heights]

Row 3 (LINE_MANAGER only): Team Leave Queue
       → Full-width card
       → Invisible to EMPLOYEE-only users
       → Renders only when `currentUser?.roles.includes('LINE_MANAGER')`
       [Height: ~200px for 3 pending requests]
```

**Above-the-fold at mobile (375×812, iPhone SE-class):**

Shell top bar: 48px. Remaining: 764px minus bottom nav (64px + safe area ~34px) = ~682px available. Row 1 (2×2 KPI grid at ~200px + gap) + Row 2 start (header of payslip card ~56px) ≈ 280px. Both KPI row and top of payslip card visible. Employee sees their balance immediately on open.

**Above-the-fold at 1366×768:**

Shell top bar 56px. Page header 73px. Remaining: 639px. py-8 (32px). Available: ~575px. Row 1 (KPI at ~110px + 20px gap) + Row 2 (payslips/leave side-by-side at ~240px + 20px gap) = 390px. Full KPI strip and full secondary row fit above the fold. LINE_MANAGER team section starts just at fold — visible on scroll.

**Reading order:** Z-pattern on mobile (top-left balance → top-right sick leave → bottom-left pay → bottom-right pending). Column-based on desktop (left=payslips, right=leave).

**Mobile collapse pattern:** KPI strip is `grid-cols-2`. Secondary row stacks to single column (payslips above, leave requests below). Team queue renders full width below. Bottom nav provides primary navigation; dashboard is overview only.

---

## Section E: Visual Language

### E1. Color Token Usage

| Role | Token(s) | Usage |
|------|----------|-------|
| Page background | `surface-alt` (`#f8f7f4`) | Background behind the card grid — matches `TenantAdminShell` bg |
| Card backgrounds | `surface` (`#ffffff`) | All widget cards use `bg-surface` |
| Headings and KPI numbers | `near-black` (`#02110c`) | `StatCard` value, `PageHeader` title, table body text |
| Secondary labels | `neutral-500` | KPI label text, column headers |
| Captions / sub-labels | `neutral-400` | Sub-label under KPI value, date strings |
| Table header bg | `neutral-50` | DataTable thead background |
| Table borders | `neutral-200` | Card borders, table row dividers |
| Success / healthy state | `surface-tint` bg + `border-success` border | Leave balance card when balance > 5 days |
| Warning / attention state | `amber-light` bg + `amber-text` text | Leave balance card when balance ≤ 5 days; pending badge |
| Error state | `bg-red-50` + `text-red-700` | FAILED payroll run InlineAlert |
| Primary CTA button | `bg-amber` + `text-near-black` | "+ Run Payroll" button (variant="cta") |
| Secondary action | `border-brand-900` + `text-brand-900` | "Export" and "View all" buttons (variant="outline") |
| Active chart bar | `brand-900` (`#0b3d2e`) | Current month bar in payroll trend |
| Inactive chart bars | `brand-100` (`#d1f5e6`) | Prior month bars |
| NavRailItem active state | `bg-brand-50` + `text-brand-900` + `border-l-2 border-brand-500` | Dashboard nav item active (light theme) |
| Badge: approved/completed | `bg-brand-100` + `text-brand-800` | Payroll COMPLETED, leave APPROVED |
| Badge: pending/calculating | `bg-amber-light` + `text-amber-text` | Payroll CALCULATING, leave PENDING |
| Badge: failed/rejected | `bg-red-100` + `text-red-700` | Payroll FAILED, leave REJECTED |
| Badge: draft/neutral | `bg-neutral-100` + `text-neutral-600` | Payroll DRAFT, leave CANCELLED |

**Rules enforced:**
- Never use `gray-*` — always `neutral-*`.
- Never use raw hex in `className`. Raw hex permitted only in Recharts `fill`/`stroke` props.
- `bg-white` in the current employee `MetricCard` is a violation — replace with `bg-surface`.

---

### E2. Typography Scale

| Element | Class | Notes |
|---------|-------|-------|
| Page title (PageHeader) | `text-[20px] font-bold text-near-black tracking-tight` | Defined in `PageHeader` component |
| Page subtitle | `text-[13px] text-neutral-500` | Date/time in admin; position/dept in employee |
| Widget card title | `text-[14px] font-bold text-near-black` | Card header labels |
| KPI label | `text-[12px] font-semibold uppercase tracking-wide text-neutral-500` | `StatCard` label |
| KPI value (number) | `text-[28px] font-bold text-near-black leading-none` | `StatCard` value slot |
| KPI sub-label | `text-[12px] text-neutral-400` | e.g. "47 employees · April 2026" |
| Leave balance value | `text-[28px] font-bold` (via StatCard) | Days remaining |
| Money amount (KPI) | `text-[28px] font-bold` (via `MoneyAmount size="xl"`) | Net pay KPI |
| Money amount (table) | `text-[13px]` (via `MoneyAmount size="sm"`) | Table cell amounts |
| Table column header | `text-[11px] font-semibold uppercase tracking-wide text-neutral-400` | `DataTable` thead |
| Table body | `text-[13.5px] text-neutral-700` | `DataTable` tbody |
| Chart axis labels | `text-[10px] fill-neutral-400` | Recharts XAxis/YAxis tick |
| Badge text | `text-[11px] font-semibold` | `Badge` component |
| "View all" link | `text-[12px] font-semibold text-brand-700 hover:underline` | Card header right slot |
| Section group label | `text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400` | NavRail group label pattern |

---

### E3. Spacing Rhythm

| Zone | Value | Token / Class |
|------|-------|---------------|
| Page content padding | 32px all sides | `px-8 py-8` |
| Gap between widget rows | 20px | `gap-5` (within grids and flex columns) |
| Card internal padding | 20px | `p-5` (StatCard, widget cards) |
| Card header padding | `px-6 py-4` | Widget card headers |
| Table cell padding | `px-5 py-3.5` | DataTable cells |
| Gap within KPI strip | 20px | `gap-5` via `KpiGroup` |
| Border radius on cards | `rounded-xl` | Consistent across all widgets |
| Chart top margin | 16px | `mt-4` before BarChart/DonutChart |

---

### E4. Lucide Icon Choices

| Concept | Icon | Size | Context |
|---------|------|------|---------|
| Run payroll / initiate | `Play` or `Zap` | 16 | CTA button icon prefix |
| Export / download | `Download` | 16 | Export report button |
| Employees / headcount | `Users` | 18 | Admin KPI — total employees |
| Pending leave / clock | `Clock` | 18 | Admin KPI — pending approvals |
| Payroll / money | `Banknote` | 18 | Admin KPI — net payroll |
| Status / check | `CheckCircle` | 18 | Admin KPI — last run status (if COMPLETED) |
| Status / warning | `AlertTriangle` | 18 | Last run status (if FAILED) |
| Trend / chart | `TrendingUp` | 16 | Payroll trend card header |
| Calendar | `Calendar` | 16 | Leave request date ranges |
| Annual leave | `UmbrellaOff` or `CalendarDays` | 20 | Employee KPI — leave balance |
| Sick leave | `Thermometer` | 20 | Employee KPI — sick balance |
| Pay / wallet | `Wallet` | 20 | Employee KPI — net pay |
| Pending / hourglass | `Hourglass` | 20 | Employee KPI — pending requests |
| Team / manager | `UsersRound` | 20 | LINE_MANAGER team widget header |
| Approve action | `Check` | 14 | Quick-approve button in team queue |
| Reject action | `X` | 14 | Quick-reject button in team queue |
| View all (arrow) | `ArrowRight` | 14 | "View all →" links |
| Error / system | `XCircle` | 15 | InlineAlert error variant |
| Offline | `WifiOff` | 14 | OfflineBadge (existing) |

---

## Section F: Interaction Patterns

### F1. Admin Dashboard — What Is Clickable

| Element | Action |
|---------|--------|
| KPI: Active Employees card | Navigate to `/admin/employees` |
| KPI: Pending Leave card | Navigate to `/admin/leave?status=PENDING` |
| KPI: Latest Net Payroll card | Navigate to `/admin/payroll/{latestRunId}` |
| KPI: Last Run Status card | Navigate to `/admin/payroll/{latestRunId}` |
| "+ Run Payroll" button | Navigate to `/admin/payroll/new` |
| "Export report" button | Download (to be implemented — propose removing until export endpoint exists) |
| Payroll trend "View all runs" link | Navigate to `/admin/payroll` |
| Payroll trend period tabs | Filter the chart data to the selected window (requires fixing the period filter bug) |
| Recent Payroll Runs table rows | Navigate to `/admin/payroll/{runId}` |
| Recent Payroll Runs "View all →" link | Navigate to `/admin/payroll` |
| Attendance Snapshot card | Navigate to `/admin/attendance` |
| Leave Type Breakdown card | Navigate to `/admin/leave` |

**Not clickable:** Chart bars (tooltip on hover only), StatCard labels, table column headers (no sort in current DataTable design).

---

### F2. Employee Dashboard — What Is Clickable

| Element | Action |
|---------|--------|
| Annual Leave balance card | Navigate to `/my/leave/apply` |
| Sick Leave balance card | Navigate to `/my/leave` |
| Latest Net Pay card | Navigate to `/my/payslips/{latestPayslipId}` |
| Pending Requests card | Navigate to `/my/leave` |
| Payslip table row | Navigate to `/my/payslips/{id}` |
| "View all →" payslips link | Navigate to `/my/payslips` |
| Leave request table row | Navigate to `/my/leave/{id}` (open question — page may not exist yet) |
| "Apply + view all →" leave link | Navigate to `/my/leave` |
| LINE_MANAGER "Approve" button | `POST /api/v1/leave/requests/{id}/approve` inline action; optimistic update |
| LINE_MANAGER "Reject" button | Open a small inline reason input, then `POST /api/v1/leave/requests/{id}/reject` |
| LINE_MANAGER "View team →" link | Navigate to `/my/team/leave` |

**Not clickable:** KPI labels, balance sub-labels, leave type names in the balance cards.

---

### F3. Loading States

| Widget | Loading treatment |
|--------|-------------------|
| KPI strip (all 4 cards) | `StatCard` with `value="—"` and `label="Loading"` using `Array.from({length:4})` skeleton loop (current implementation). Replace with actual `Skeleton` components inside cards. |
| Payroll trend chart | Spinner or "Loading…" placeholder at `h-[160px]` within the chart area |
| Recent Runs table | `DataTable isLoading={true}` — renders 6 skeleton rows (built into `DataTable`) |
| Leave balances (employee) | `StatCard value="—"` while query is in-flight |
| Recent Payslips (employee) | Skeleton rows — 3 placeholder rows matching table row height |
| Recent Leave Requests (employee) | Same pattern as payslips |
| Team Leave Queue (LINE_MANAGER) | 3 skeleton rows |

---

### F4. Error States

| Widget | Error treatment |
|--------|----------------|
| All 3 admin queries fail simultaneously | Full-width `InlineAlert variant="error"` at top of content (current implementation) |
| Single query fails | Affected KPI cards show `value="—"` with `sub="Could not load"`. Chart area shows "Could not load payroll data" placeholder. Table shows `emptyMessage="Could not connect to the service."` |
| Employee profile query fails | `InlineAlert variant="error"` with personalized message (current implementation) |
| Leave balances fail (employee) | Balance cards show `value="—"`. No InlineAlert — leave service failure is not a critical emergency for the employee session. |
| Payslips fail (employee) | Payslips card shows "Could not load payslips" in the empty-state slot |

---

### F5. Empty States

| Scenario | Treatment |
|----------|-----------|
| Zero payroll runs (new tenant) | Payroll KPI cards show "No runs yet". Chart shows "No payroll runs yet" placeholder. Table shows "No payroll runs yet" empty state. Replace the "Export report" button with an invitation: "+ Create your first payroll run". |
| Zero employees (new tenant) | Employee KPI shows "0". Below the KPI strip, show an `InlineAlert variant="info"` with "Get started by adding your first employee" and a link to `/admin/employees/new`. |
| Zero leave requests (new tenant) | Pending leave KPI shows "0" in neutral grey. No alert needed. |
| Zero payslips (employee, new hire) | Payslip card shows "No payslips available yet. Payslips appear here after each payroll run." |
| Zero leave requests (employee) | Leave card shows "No leave requests yet." with a link to apply. |
| Zero pending team requests (LINE_MANAGER) | Team queue shows "No pending requests from your team." No spinner — renders the empty state immediately. |

---

### F6. Polling and Refresh Behavior

The dashboard is primarily a session-level snapshot, not a real-time feed. Payroll runs for Kenyan SMEs do not change state during a typical admin dashboard session (an HR manager is not sitting watching a payroll run process). Leave requests change infrequently.

Recommendation: **No automatic polling.** Use `staleTime: 5 * 60 * 1000` (5 minutes) in React Query for all dashboard queries. The `refetchOnWindowFocus: true` default behavior means that switching tabs and returning re-fetches, which is sufficient for this session pattern.

The employee dashboard should also avoid polling. The payslip list changes once per payroll cycle. Leave request status changes infrequently (HR approval is not instant). Mobile data connections in Kenya make aggressive polling costly for users on limited data plans.

**One exception:** The LINE_MANAGER team queue. If a LINE_MANAGER is actively approving requests, the queue should update after each approve/reject action via optimistic update + invalidation of the `["dashboard-leave-pending"]` query key.

---

## Section G: Design Decisions and Rationale

1. **Latest payroll run is the top KPI on admin dashboard:** Admins return primarily to confirm last run completed cleanly; FAILED status demands immediate action before anything else.

2. **Pending leave count is the second KPI, not third:** Leave approval blocks employees from taking time off; it is a daily operational queue item for any HR-facing admin role.

3. **Active employee headcount adds the `status=ACTIVE` filter that the current implementation omits:** Terminated employees inflating the headcount is misleading and could cause wrong payroll estimates; the filter costs nothing and is already supported by the backend.

4. **The payroll trend period tabs are frozen (12 months only) until the filter is fixed:** Shipping a cosmetic UI control that does nothing is worse than not shipping it; the tab UI should be removed or disabled until the period filter is wired to an actual date-range query.

5. **"Export report" button label is incorrect in current implementation:** The button calls refetch on all queries; relabelling to "Refresh" or removing it entirely until a real export endpoint exists prevents user confusion.

6. **Leave balance leads the employee dashboard, not net pay:** Kenyan employees check leave balances more frequently than payslips; leave governs planning decisions (school holidays, travel) while payslip is a monthly confirmation.

7. **Annual leave card gets `surface-tint`/`border-success` when healthy and `amber-light` when low:** The colour state communicates urgency without requiring the user to interpret a number; a low balance is worth flagging, a healthy balance deserves a calm green.

8. **Employee MetricCard must be replaced with `StatCard` from `@andikisha/ui`:** The local component duplicates `StatCard` exactly but uses `bg-white` instead of `bg-surface`; duplication creates maintenance drift and the raw `bg-white` may diverge from the token system.

9. **Recent Payslips table rows must be clickable:** Listing payslips with no way to open them is incomplete; the destination (`/my/payslips/{id}`) is a natural next step that reduces navigation hops.

10. **LINE_MANAGER team queue lives in `/my/dashboard`, not `/admin/*`:** Per CLAUDE.md and the menu source of truth, LINE_MANAGER does not have access to `/admin/*`; all their surfaces live in `/my/*` with conditional rendering based on role presence.

11. **LINE_MANAGER quick-approve/reject is an inline action, not a page navigation:** Requiring a LINE_MANAGER to navigate three levels deep (dashboard → leave list → leave detail → approve button) to approve a single request is excessive for a common task; an inline action with a result toast is the right trade-off.

12. **No polling for any widget:** Kenyan SME users on mobile data plans are sensitive to data usage; 5-minute staleTime with window-focus refetch is sufficient for the session patterns observed; real-time payroll status requires websocket infrastructure not yet built.

13. **DonutChart for attendance snapshot, not a bar chart:** A single-day attendance split (present/late/absent) is a part-to-whole relationship, which a donut communicates better than a bar; the existing `DonutChart` primitive handles this with a center slot showing the ratio.

14. **Attendance snapshot requires a new backend aggregate endpoint:** The existing `GET /api/v1/attendance/daily` returns a page of individual records; computing attendance stats client-side by paginating through all records is inefficient and incorrect for large orgs; a dedicated summary endpoint is required.

15. **Supporting row (attendance + leave type breakdown) is below the fold:** These widgets are informational, not action-driving; admins who want this detail scroll deliberately; the primary payroll and leave widgets must be immediately visible.

16. **4-column KPI strip on admin, 4-column KPI strip on employee:** Consistent with the SmartHR template's structural pattern (the `col-xxl-8` widget grid of 4+4 cards in `template/smarthr-html/index.html`); 4 cards is the maximum for 1366px at the given card min-width; `KpiGroup cols={4}` handles the responsive collapse to 2×2 on mobile automatically.

17. **PageHeader subtitle on employee dashboard shows position and department, not date/time:** The date is less valuable than role context for an employee who may check this weekly; the admin sees date/time because payroll runs are date-sensitive; the employee needs "Senior Accountant · Finance" to confirm they are in the right account.

18. **Empty state for new tenant on admin dashboard surfaces a call-to-action:** A zero-employee, zero-payroll-run tenant has no useful dashboard data; the empty state converts dead space into onboarding guidance and reduces bounce back to the documentation.

19. **Leave type breakdown widget is below fold and depends on a new backend aggregate:** It is a supporting widget with lower priority; its omission from MVP does not break the admin dashboard's core value; it is documented here so the backend team knows it is coming.

20. **`MoneyAmount` component used for all monetary values:** Consistency in currency display (always KES prefix, always tabular-nums, always font-mono for alignment) is not achievable if some widgets use `KES ${value.toLocaleString()}` string interpolation as the current employee dashboard does; `MoneyAmount` must be applied uniformly.

---

## Section H: Open Questions for Lawrence

1. **Leave approval for LINE_MANAGER — team scope:** The existing `GET /api/v1/leave/requests?status=PENDING` returns all tenant pending requests (any approver). LINE_MANAGER should only see their direct reports' requests. Does `leave-service` have a concept of reporting structure / team membership, or does it need one? If not, how should the LINE_MANAGER team queue be scoped?

2. **Leave request detail page:** Does `/my/leave/{id}` exist as a page? The current leave request table in the employee dashboard has non-clickable rows. If the detail page does not exist, rows should not be made clickable until it does. What is the priority for this page?

3. **Export report functionality:** The "Export report" button currently re-fetches data (a bug). What should the exported report contain? Payroll summary PDF? CSV of the recent runs? Is there a backend endpoint planned? Until this is decided, the button should be removed or relabelled "Refresh".

4. **Zero-employee tenant onboarding state:** Should the admin dashboard show an onboarding checklist (add employees → configure leave policies → run first payroll) rather than empty widget states? Some SaaS platforms use the dashboard as an onboarding progress tracker for new tenants. Is this in scope?

5. **Attendance snapshot availability:** Not all tenants will use the time-attendance-service (time tracking is optional for many Kenyan SMEs who pay fixed monthly salaries without tracking hours). Should the attendance widget be hidden by default and shown only when the tenant has attendance data? Or should it always appear and show "Attendance not configured" empty state?

6. **Trial/licence status indicator:** Should the admin dashboard show a banner or widget indicating the tenant's subscription tier (Starter / Professional / Enterprise) and remaining trial days if on trial? This is common SaaS practice and helps surface upsell prompts.

7. **Payroll status on employee dashboard:** The employee sees "Latest Net Pay" but not the payroll run status (e.g. PROCESSING, not yet PAID). Should the employee see the payment status badge prominently, or is it sufficient that `MoneyAmount` renders after the run completes? Is there a risk that employees see a net pay amount for a run that is CALCULATED but not yet PAID, causing confusion?

8. **Multiple leave type balances on employee dashboard:** The current design shows only Annual and Sick leave. Should Maternity or Paternity leave balances appear? These are time-sensitive entitlements. If a user is on Maternity leave right now, is her remaining balance relevant on the dashboard?

9. **Notification surface:** The notification-service is Phase 3. In the interim, should the employee dashboard show a static alert for recently changed leave request status (e.g. "Your leave request for 15–17 May was approved")? Or is the status badge on the leave request row sufficient?

10. **LINE_MANAGER reject flow:** The inline reject action requires a rejection reason field (the `ReviewLeaveRequest` DTO requires `rejectionReason`). Should this be an inline textarea that appears on the row, a small modal, or a slide-over? The choice affects whether a new primitive is needed.

11. **Payslip download button:** Currently the payslip table rows are not clickable. Should clicking a payslip row open a detail page, or trigger a PDF download directly? If it is a PDF download, is there a backend endpoint at `GET /api/v1/payroll/payslips/{id}/download` or similar?

---

## Section I: New Primitives Required

The following `@andikisha/ui` components are required by this dashboard design and do not currently exist. None are built here — they are identified for the primitives work.

---

**1. `LeaveBalanceCard`**

A variant of `StatCard` specifically for leave balances. Accepts `days: number`, `leaveType: string`, `lowThreshold?: number` (default: 5). Renders with `surface-tint`/`border-success` when `days > lowThreshold` and `amber-light`/`amber` border when `days <= lowThreshold`. Includes a link slot for a CTA (e.g. "Apply" button). This is Tier 1 — data-agnostic (it takes `days` and `leaveType` as raw values, no API call).

```typescript
interface LeaveBalanceCardProps {
  leaveType: string;       // "Annual", "Sick", etc.
  available: number;       // days remaining
  lowThreshold?: number;   // default 5 — triggers amber state
  href?: string;           // optional CTA destination
  ctaLabel?: string;       // optional CTA button label, e.g. "Apply"
}
```

---

**2. `QuickActionList`**

A compact list widget suitable for the LINE_MANAGER team queue and any future "action needed" surfaces. Renders a list of items with: avatar or icon slot, primary text, secondary text, and an actions slot (buttons). Supports an empty state slot. This is Tier 1 — it knows nothing about leave or employees; it is a generic action-list container.

```typescript
interface QuickActionItem {
  id: string;
  icon?: ReactNode;        // avatar component or Lucide icon
  primary: string;         // employee name or primary label
  secondary?: string;      // "Annual · 15–17 May · 3 days"
  badge?: ReactNode;       // status badge
  actions?: ReactNode;     // Approve/Reject buttons
}

interface QuickActionListProps {
  title: string;
  items: QuickActionItem[];
  emptyState?: ReactNode;
  footerHref?: string;
  footerLabel?: string;
  isLoading?: boolean;
}
```

---

**3. `AttendanceSummaryCard`**

A card combining a `DonutChart` with a legend showing present/late/absent percentages and a total ratio in the donut center. This is Tier 1 — it accepts `{ present: number, late: number, absent: number, total: number }` as props, no API call.

```typescript
interface AttendanceSummaryCardProps {
  present: number;
  late: number;
  absent: number;
  total: number;
  date?: string;           // e.g. "Today, 18 May" — shown in card header
  href?: string;           // "View Details" link destination
}
```

---

**4. `ClickableTableRow` (or `DataTable` update)**

The current `DataTable` supports `onRowClick` but no visual affordance that rows are clickable beyond the `cursor-pointer` and `hover:bg-neutral-50`. For accessibility and clarity, rows that are clickable should have an `ArrowRight` icon in the trailing cell, hidden on hover and visible on hover/focus on mobile. This could be an option prop added to `DataTable`:

```typescript
// Addition to existing DataTableProps:
showRowArrow?: boolean;   // renders ArrowRight in trailing position on clickable rows
```

This is a minor enhancement to an existing primitive rather than a new component.

---

## Section J: Implementation Readiness

### J1. Admin Dashboard Widgets

| Widget | Status | Notes |
|--------|--------|-------|
| KPI: Active Employee Headcount | READY | Add `status=ACTIVE` filter to existing query |
| KPI: Pending Leave Count | READY | Endpoint exists, already implemented |
| KPI: Latest Net Payroll | READY | Endpoint exists, already implemented |
| KPI: Last Run Status | READY | Same query as net payroll |
| Payroll Trend Chart | READY (partial) | Fix period tab filter bug; endpoint exists |
| Recent Payroll Runs Table | READY | Endpoint exists, already implemented |
| Attendance Snapshot | NEEDS_BACKEND | Requires new `GET /api/v1/attendance/daily/summary` endpoint |
| Leave Type Breakdown | NEEDS_BACKEND | Requires new aggregate endpoint or client-side aggregation from paginated results |

### J2. Employee Dashboard Widgets

| Widget | Status | Notes |
|--------|--------|-------|
| Annual Leave Balance Card | NEEDS_PRIMITIVE | `LeaveBalanceCard` primitive needed; backend endpoint READY |
| Sick Leave Balance Card | NEEDS_PRIMITIVE | Same primitive; backend endpoint READY |
| Latest Net Pay Card | READY | Replace local `MetricCard` with `StatCard`; add click navigation |
| Pending Requests Count Card | READY | Replace local `MetricCard` with `StatCard` |
| Recent Payslips List | READY | Replace inline `<table>` with `DataTable`; add `onRowClick` |
| Recent Leave Requests List | READY | Replace inline `<table>` with `DataTable`; add `onRowClick` (destination page TBD — see open question H2) |
| LINE_MANAGER Team Leave Queue | NEEDS_BACKEND + NEEDS_PRIMITIVE | Requires team-scoped leave endpoint AND `QuickActionList` primitive |

### J3. New Primitives

| Primitive | Status |
|-----------|--------|
| `LeaveBalanceCard` | NEEDS_PRIMITIVE |
| `QuickActionList` | NEEDS_PRIMITIVE |
| `AttendanceSummaryCard` | NEEDS_PRIMITIVE (depends on NEEDS_BACKEND attendance aggregate) |
| `DataTable showRowArrow` prop | READY to implement — minor addition to existing component |

---

## Appendix: SmartHR Template Reference Notes

The following structural observations from `template/smarthr-html/index.html` are relevant to this design. No Bootstrap classes or template code enter the product.

- **8-widget info grid (col-xxl-8):** The template places 8 small KPI cards in a 4×2 grid taking 2/3 of the main area, with the remaining 1/3 holding a taller card (Employees by Department). The AndikishaHR design simplifies this to a 4-column KPI strip — appropriate for a payroll-focused HR tool where 8 cards would scatter attention.

- **Welcome banner with name + pending count:** The template shows "Welcome Back, Adrian — you have 21 Pending Approvals & 14 Leave Requests" as a prominent banner. This pattern is reused in the AndikishaHR employee dashboard PageHeader (greeting with name). The admin PageHeader has date/time instead, which is more relevant for a payroll-cycle-driven admin.

- **Attendance Overview card with DonutChart + status legend:** Matches the proposed `AttendanceSummaryCard` design exactly. The SmartHR card renders a canvas donut with center text and a Present/Late/Permission/Absent breakdown below. The AndikishaHR equivalent uses the existing `DonutChart` primitive.

- **Clock-In/Out feed:** The template shows a scrollable list of recent clock-ins with employee avatar, name, role, and time. This is deferred in AndikishaHR — attendance tracking may not be enabled for all tenants and the data model requires a daily attendance summary endpoint that does not yet exist.

- **4-column KPI strip spacing:** The template cards use a consistent padding pattern (internal padding + card border) that maps to AndikishaHR's `p-5` + `border border-neutral-200 rounded-xl` combination on `StatCard`.

---

*Document produced in the design phase. No React or TypeScript code was written. Implementation should follow the widget inventory and readiness flags in Section C and J.*
