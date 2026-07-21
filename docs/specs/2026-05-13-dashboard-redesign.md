# Dashboard Redesign — tenant-portal

**Date**: 2026-05-13  
**Status**: Revised — awaiting Lawrence sign-off on flagged decisions before implementation plan  
**Scope**: `frontend/tenant-portal` — `/admin/dashboard` and `/my/dashboard`  
**Template reference**: `template/smarthr-html/index.html` (admin), `template/smarthr-html/employee-dashboard.html` (employee)  
**Stack**: Tailwind CSS v4, Lucide React, Roboto, brand tokens, Recharts, `@andikisha/ui`

---

## Backend Endpoint Verification

Grepped `services/` on 2026-05-13. Results are the source of truth for all data-wiring decisions in this spec. Replace no assumption with a fact.

### Endpoints that DO NOT EXIST — must be built before wiring

| Endpoint | Where spec uses it | Action required |
|---|---|---|
| `GET /api/v1/attendance/today/summary` | Admin KPI card "Present Today" | New endpoint in `time-attendance-service`. Suggested response: `{ presentCount, absentCount, onLeaveCount, totalCount }`. Until built, card renders "Coming soon" skeleton — **do not call this endpoint**. |
| `GET /api/v1/employees/by-department` | Admin chart — Department donut | New endpoint in `employee-service`. Suggested response: `[ { department, count } ]`. Until built, donut renders "Coming soon" skeleton — **do not call this endpoint**. |
| `GET /api/v1/employees/status-summary` | Admin widget — Employee Status | New endpoint in `employee-service`. Suggested response: `{ fulltime, contract, probation, partTime, total }`. Until built, widget is omitted entirely from the lower section — **do not call this endpoint**. |

### Endpoints that EXIST — verified, with corrected paths and shapes

**`GET /api/v1/attendance/employees/{employeeId}/monthly-summary?period=YYYY-MM`**  
Controller: `AttendanceController` · Service: `time-attendance-service`  
Auth: `ADMIN`, `HR_MANAGER`, `HR`, `EMPLOYEE`  
Frontend: populate `{employeeId}` from the `x-employee-id` response header set by middleware.  
Response shape (`MonthlySummaryResponse`):
```
employeeId: UUID
period: String          // "YYYY-MM"
daysPresent: int
daysAbsent: int
daysOnLeave: int
daysHoliday: int
totalHoursWorked: BigDecimal
regularHours: BigDecimal
overtimeWeekday: BigDecimal
overtimeWeekend: BigDecimal
overtimeHoliday: BigDecimal
lateDays: int
earlyDepartureDays: int
```
Donut segments map as: `daysPresent − lateDays` = On Time · `lateDays` = Late · `daysAbsent` = Absent · `daysOnLeave` = On Leave.  
> **Spec error corrected**: the previous spec referenced `/api/v1/attendance/me/monthly-summary`. That path does not exist. Use the path above.

---

**`POST /api/v1/leave/requests/{id}/approve`**  
Controller: `LeaveController` · Service: `leave-service`  
Auth: `HR_MANAGER`, `HR`, `ADMIN`, `LINE_MANAGER`  
Request body: **none**. Required headers: `X-Tenant-ID`, `X-User-ID`, `X-User-Name` (set by middleware).  
Response: `LeaveRequestResponse` (full request record with updated status).  
> **Spec error corrected**: previous spec said `PUT`. Actual method is `POST`.

---

**`POST /api/v1/leave/requests/{id}/reject`**  
Controller: `LeaveController` · Service: `leave-service`  
Auth: `HR_MANAGER`, `HR`, `ADMIN`, `LINE_MANAGER`  
Request body: `{ "rejectionReason": "string" }` — `@NotBlank` enforced server-side.  
Response: `LeaveRequestResponse`.  
> **Spec error corrected**: previous spec said `PUT`. Actual method is `POST`.

---

**`GET /api/v1/leave/requests?status=PENDING&size=1`**  
Controller: `LeaveController` · Auth: `HR_MANAGER`, `HR`, `ADMIN`, `LINE_MANAGER`  
Used by: admin welcome banner pending-count + admin KPI card "Pending Leave". Returns `Page<LeaveRequestResponse>` — use `totalElements` only.

---

**`GET /api/v1/leave/employees/{employeeId}/requests`** (pageable)  
Controller: `LeaveController` · Auth: own employee, or any admin role  
Frontend: populate `{employeeId}` from `x-employee-id` header.  
Note: no server-side status filter on this endpoint. To derive pending count for the leave balance card, fetch `size=50` and count `status === "PENDING"` client-side (acceptable — employees have few requests).  
> **Spec error corrected**: previous spec referenced `/api/v1/leave/requests/me`. That path does not exist.

---

**`GET /api/v1/leave/employees/{employeeId}/balances?year=YYYY`**  
Controller: `LeaveController` · Auth: own employee, or any admin role  
Response: `List<LeaveBalanceResponse>`:
```
employeeId: UUID
leaveType: String       // "ANNUAL", "SICK", "MATERNITY", etc.
year: int
accrued: BigDecimal
used: BigDecimal
carriedOver: BigDecimal
available: BigDecimal
frozen: boolean
```
Used by: employee leave balance card (Annual → `available` where `leaveType=ANNUAL`, Sick → `available` where `leaveType=SICK`, Taken YTD → `used` across all types).

---

### Event publishing (existing — confirmed)

`LeaveService` already publishes via `LeaveEventPublisher`:
- `LeaveApprovedEvent` on approve
- `LeaveRejectedEvent` on reject
- `LeaveReversedEvent` on HR reversal

These propagate via RabbitMQ. Whether `audit-service` subscribes to these specific events has not been confirmed in this grep pass — see **Audit log requirement** under Shared rules.

### Charting library

`recharts: ^2.15.0` ✅ confirmed in `frontend/tenant-portal/package.json`. Use Recharts for all charts. No additional chart library to be added.

---

## Context

The two existing dashboard pages were scaffolded during the portal consolidation. Both need redesigning to match the SmartHR template's structural layout. This spec captures the agreed layout for both surfaces.

**Cross-portal layout policy (decided in brainstorm):**  
The layout pattern defined in this spec applies to all AndikishaHR portals except `platform-portal`. The `platform-portal` (SUPER_ADMIN surface, Prompt A.5) will have its own layout derived from the SmartHR Super Admin section.

---

## Admin Dashboard — `/admin/dashboard`

### Top section

**Welcome banner**  
A card spanning full width at the top of the content area, below the page header. Contains:
- Left: Avatar circle (initials, brand-900 background) + greeting "Welcome back, [firstName]" + summary line "X pending approvals · Y leave requests" (counts from live API via `GET /api/v1/leave/requests?status=PENDING&size=1`)
- Right: role-gated action buttons (see below)

**Welcome banner role gating:**

| Role | Buttons rendered |
|---|---|
| `ADMIN`, `PAYROLL_OFFICER` | "Export Report" ghost button + "+ Run Payroll" primary (brand-900) → `/admin/payroll/new` |
| `HR_MANAGER`, `HR` | "Export Report" ghost button only |

Role is read from the JWT payload forwarded by middleware. The frontend reads the `x-user-role` header (or decodes the cookie client-side — confirm approach when middleware Prompt B lands; for now read from a context value set by the permissive middleware). Until Prompt B role guards are wired, render both buttons and add a `// TODO(prompt-b): gate Run Payroll on ADMIN|PAYROLL_OFFICER` comment.

---

**4 KPI cards** (equal-width, one row)

| # | Label | Value source | Sub-label | Status |
|---|---|---|---|---|
| 1 | Total Employees | `GET /api/v1/employees?size=1` → `totalElements` | "Active headcount" | ✅ endpoint exists |
| 2 | Present Today | `GET /api/v1/attendance/today/summary` → `presentCount/totalCount` | Attendance % | ❌ endpoint missing — render "Coming soon" skeleton |
| 3 | Pending Leave | `GET /api/v1/leave/requests?status=PENDING&size=1` → `totalElements` | "Awaiting approval" | ✅ endpoint exists |
| 4 | Latest Payroll Net | `GET /api/v1/payroll/runs?size=1&sort=createdAt,desc` → first run `totalNet` | Period + status badge | ✅ endpoint exists |

Each card: coloured icon circle (brand accent colours), metric label, large value using `MoneyAmount` for card #4, sub-label, "View →" link.

> **⚠ Decision required from Lawrence — KPI card #1**: Is "Total Employees" the right use of the first card slot, or should it be replaced with "Compliance Status" (next statutory filing deadline with days remaining, colour-coded by urgency: green > 14 days, amber 7–14 days, red < 7 days)? "Total Employees" is passive; "Compliance Status" is actionable and Kenya-specific. Leave as "Total Employees" for now and flag this for confirmation before the implementation plan is written.

---

**Chart row** (two columns, 60/40 split)

- Left (60%): Payroll Trend bar chart — monthly net payroll, current month highlighted brand-900, prior months brand-100. Period tabs: 12 months / 6 months / 3 months. Built with Recharts `BarChart`. Data: `GET /api/v1/payroll/runs?size=12&sort=period,desc`.
- Right (40%): Employees by Department — donut chart using Recharts `PieChart`. Segments coloured with brand palette. Legend below. Data: `GET /api/v1/employees/by-department`. **Endpoint does not exist** — render "Coming soon" skeleton. Do not call this endpoint until it is built.

---

### Responsive layout — admin dashboard

| Breakpoint | Welcome banner | KPI cards | Chart row |
|---|---|---|---|
| `lg` and above (≥1024px) | Side-by-side (text left, buttons right) | 4 columns | 60/40 two-column |
| `md` (768px–1023px) | Stacked (text top, buttons below) | 2 columns × 2 rows | Stacked (chart full width, donut below) |
| `sm` and below (<768px) | Stacked | 1 column × 4 rows | Stacked |

---

### Lower section

**Full-width: Recent Payroll Runs table**  
Columns: Period · Employees · Gross · Net Pay · Status  
Rows: Last 5 runs, clickable → `/admin/payroll/[runId]`  
Data: `GET /api/v1/payroll/runs?size=5&sort=createdAt,desc`  
"View all →" link in header → `/admin/payroll`

**Two-column row below the table (60/40 split)**

Left (60%) — Pending Leave Approvals (see Approval flow subsection below)

Right (40%) — Employee Status  
- Stacked progress bar (Fulltime / Contract / Probation / Part-time), coloured with brand palette
- 2×2 grid of count tiles below: each shows employment type label + headcount
- Data: `GET /api/v1/employees/status-summary` — **endpoint does not exist**. Omit this widget entirely until the endpoint is built. Do not render a skeleton — just remove the right column and let the Pending Leave panel take full width.

**Responsive layout — admin lower section**

| Breakpoint | Payroll table | 60/40 row |
|---|---|---|
| `md` and above | Full width, all columns | Side by side |
| Below `md` | Full width, drop Gross column | Stack (Leave panel on top, Employee Status if present below) |

---

### Pending Leave Approvals — Approval flow

Widget: lists up to 5 pending leave requests. Columns: employee name · leave type · date range · duration.

**Approve action**  
- Inline button per row: "Approve" (brand-100 background, brand-900 text)
- On click: immediately calls `POST /api/v1/leave/requests/{id}/approve` (no body required)
- On success: show a brief success toast, invalidate `dashboard-leave-pending` React Query key
- On error: show inline error row — do not dismiss the widget

**Reject action**  
- Inline button per row: "Reject" (red-50 background, red-700 text)
- On click: opens a popover anchored to the button. Popover contains:
  - Textarea labelled "Rejection reason" (placeholder: "e.g. Insufficient cover, clashes with payroll run…")
  - Client-side validation: minimum 10 characters before submit is enabled
  - "Cancel" and "Confirm rejection" buttons
- On confirm: calls `POST /api/v1/leave/requests/{id}/reject` with body `{ "rejectionReason": "..." }`
  - Server enforces `@NotBlank` — the 10-char client minimum is stricter and acts as a UX guard
- On success: close popover, show toast, invalidate cache
- On error: show error inside popover, leave it open

**Event pipeline**  
Both actions are already handled server-side: `LeaveService` publishes `LeaveApprovedEvent` / `LeaveRejectedEvent` via `LeaveEventPublisher` on every approve/reject call. These propagate via RabbitMQ and are consumed by `notification-service` to notify the employee. Whether `audit-service` subscribes to these events must be confirmed separately — see Audit log requirement below.

"Review All →" → `/admin/leave`

---

### Empty tenant state — admin dashboard

When `GET /api/v1/employees?size=1` returns `totalElements === 0`, replace the entire dashboard body (KPI cards + charts + lower section) with an onboarding checklist card. The checklist disappears permanently once `totalElements > 0`.

Checklist items (rendered as a vertical list of step cards, each with a link):

| # | Item | Link |
|---|---|---|
| 1 | Add your first employee | `/admin/employees/new` |
| 2 | Configure leave policies | `/admin/settings/leave` (placeholder — route may not exist yet; link is disabled if route 404s) |
| 3 | Set up payroll | `/admin/payroll` |
| 4 | Run your first payroll | `/admin/payroll/new` |

Each step card: checkmark icon (grey until complete) · title · short description · call-to-action link. Steps do not dynamically track completion in this iteration — they are static links. Dynamic step completion is Prompt B scope.

---

## Employee Dashboard — `/my/dashboard`

LINE_MANAGER sees this same layout. Their team-management surface is at `/my/team` (a separate page), not a dashboard widget — **except** for the conditional KPI tile described below.

### Conditional LINE_MANAGER tile

When the authenticated user's role set includes `LINE_MANAGER`, render an additional KPI tile in the top row (inserted between the Profile card and the Attendance donut, making it a 4-column row at `lg` breakpoint):

- Label: "Team approvals pending"
- Value: count of leave requests where the LINE_MANAGER is the designated approver and status = PENDING. Data: `GET /api/v1/leave/requests?status=PENDING&size=1` → `totalElements` (same query as admin; LINE_MANAGER has access per the `@PreAuthorize` in `LeaveController`).
- Sub-label: "Your direct reports"
- Link: → `/my/team`
- Component: `LineManagerTeamTile.tsx`

Until Prompt B role guards are wired, read the role from the JWT payload. Add `// TODO(prompt-b): read role set from decoded token claims` comment.

---

### Top row (3 columns — 4/12 · 5/12 · 3/12, matching template's col-xxl-4/5/3)

Becomes 4-column at `lg` when LINE_MANAGER tile is inserted (see above).

**Left (4/12) — Profile card**  
- Dark green header (brand-900 background): avatar initials circle + full name + job title · department
- Body: Email address, Employee number, Date of joining
- Data: `GET /api/v1/employees/me`

**Middle (5/12) — Attendance This Month**  
- Donut chart: On Time / Late / Absent / On Leave — coloured segments (brand-500, amber, red-400, neutral-200)
- Centre label: total days present this month (daysPresent)
- Legend list on right of donut: each category with count (derived from `MonthlySummaryResponse` — see mapping in endpoint section above)
- Data: `GET /api/v1/attendance/employees/{employeeId}/monthly-summary?period=YYYY-MM` using current month. Populate `{employeeId}` from `x-employee-id` header.
- If endpoint returns an error or `x-employee-id` is absent: render skeleton with label "Attendance tracking coming soon"

> **"Better than X%" footnote: removed.** Dropped from this spec. The data source (organisation-wide percentile calculation) is not defined, the comparison cohort is ambiguous, and the feature was not explicitly approved. Do not implement. If Lawrence later approves it, it will be added as a separate spec item.

**Right (3/12) — Leave Balance**  
- 2×2 grid:
  - Annual remaining: `available` from `LeaveBalanceResponse` where `leaveType = "ANNUAL"`
  - Sick remaining: `available` from `LeaveBalanceResponse` where `leaveType = "SICK"`  
  - Taken YTD: sum of `used` across all leave types from `LeaveBalanceResponse` list
  - Pending: count of employee's own requests where `status = "PENDING"` (derived client-side from `GET /api/v1/leave/employees/{employeeId}/requests?size=50`)
- Data: `GET /api/v1/leave/employees/{employeeId}/balances?year={currentYear}` + requests fetch above
- Primary CTA button at bottom: "+ Apply for Leave" → `/my/leave`

---

### Responsive layout — employee dashboard

| Breakpoint | Top row | Bottom row |
|---|---|---|
| `lg` and above | 3 columns (4/5/3) — or 4 columns when LINE_MANAGER tile present | 40/60 side by side |
| `md` (768px–1023px) | Stack: Profile card → Attendance donut → Leave balance | Stack: Payslip card on top, Leave requests below |
| `sm` and below | Stack: same order as `md` | Stack: same |

---

### Bottom row (2 columns, 40/60 split)

**Left (40%) — Latest Payslip card**  
- Period label (e.g. "April 2026")
- Large net pay amount — use `MoneyAmount` component with `size="xl"` and `cents={true}`
- Gross and deductions in secondary text
- Status badge (Paid / Draft)
- "View all →" → `/my/payslips`
- Data: `GET /api/v1/payslips?size=1&sort=createdAt,desc`

**Right (60%) — My Leave Requests**  
- Table: Type · Date range · Duration · Status badge
- Last 5 requests
- "Apply + view all →" → `/my/leave`
- Data: `GET /api/v1/leave/employees/{employeeId}/requests?size=5` — populate `{employeeId}` from `x-employee-id` header
- > **Spec error corrected**: previous version referenced `/api/v1/leave/requests/me`. That path does not exist in `LeaveController`. Use the employee-scoped path above.

---

## Shared implementation rules

**Visual tokens**  
All cards use `bg-surface border border-[#E5E7EB] rounded-xl` — consistent with existing dashboard shells.

**Loading states**  
Skeleton placeholder shapes, not spinners. Each widget has its own skeleton — a loading widget must not block adjacent widgets.

**Error states**  
Each widget catches its own React Query error and renders an inline muted alert. One broken endpoint must not crash the page or affect sibling widgets.

**Empty states**  
When a query succeeds but returns empty data (no payroll runs, no leave requests), show a muted "Nothing yet" message with a CTA link to the relevant full page.

**Data refresh and polling**  
Actionable widgets poll via React Query `refetchInterval`:

| Widget | refetchInterval |
|---|---|
| Pending Leave (admin) | 60 seconds |
| Present Today (admin) | 60 seconds |
| Pending approvals count (welcome banner) | 60 seconds |
| LINE_MANAGER team tile | 60 seconds |
| Pending count (employee leave balance card) | 60 seconds |

Non-actionable widgets refresh on navigation only (no polling):

| Widget | Refresh strategy |
|---|---|
| Total Employees | `staleTime: Infinity` — refresh on hard reload |
| Latest Payroll Net | `staleTime: 5 * 60 * 1000` — 5 minutes |
| Profile card | `staleTime: Infinity` — refresh on hard reload |
| Payroll trend chart | `staleTime: 5 * 60 * 1000` |

No WebSocket usage in this iteration.

**Currency formatting**  
Use the `MoneyAmount` component from `@andikisha/ui` for all rendered money values.  
For plain string formatting (e.g. export, tooltips), add a `formatMoney(amount: number, cents = true): string` utility to `@andikisha/ui` that produces `KES 250,000.00` (non-breaking space between currency and amount, always 2 decimal places). This function does not currently exist in `@andikisha/ui` — it must be added as part of this dashboard work.

The `MoneyAmount` component already uses `toLocaleString("en-KE")` internally, which formats correctly for Kenya. The new `formatMoney` function should mirror this locale.

**Date and time formatting**  
No `formatDate` or `formatTime` utilities exist in `@andikisha/ui`. Add both as part of this work:
- `formatDate(date: string | Date): string` → `"13 May 2026"` (dd MMM yyyy)
- `formatTime(date: string | Date): string` → `"14:30"` (HH:mm, 24-hour)
- Both always interpret in timezone `Africa/Nairobi` regardless of the user's browser locale
- Use `date-fns` (already in `tenant-portal/package.json`) for the implementation
- Place both in `@andikisha/ui` so the employee portal, admin portal, and any future portal can adopt them

**Audit log requirement**  
All approval, rejection, and payroll-related actions initiated from the dashboard must emit an audit event through the audit-service pipeline, identical to actions initiated from the full pages.  
> **Unconfirmed**: the grep pass confirmed that `LeaveService` already publishes `LeaveApprovedEvent` and `LeaveRejectedEvent` via RabbitMQ. Whether `audit-service` subscribes to these events has not been verified. Before wiring the Pending Leave panel's Approve/Reject buttons, confirm that audit-service consumes `LeaveApprovedEvent`/`LeaveRejectedEvent` or determine if a direct audit publish is required. This check must happen before the implementation plan is written.

**Recharts only**  
Do not add a second chart library. `recharts: ^2.15.0` is already in `package.json`.

**No new dependencies**  
No packages beyond what is already in `tenant-portal/package.json`. The `formatMoney`, `formatDate`, and `formatTime` additions go into `@andikisha/ui`, which is a workspace dependency — no new external dependency is required.

**Internal links**  
All internal links use the `/admin/*` and `/my/*` path prefixes established in the portal consolidation.

---

## Files to create / modify

| File | Action |
|---|---|
| `src/app/(admin)/admin/dashboard/page.tsx` | Full rewrite |
| `src/app/(my)/my/dashboard/page.tsx` | Full rewrite |
| `src/components/dashboard/WelcomeBanner.tsx` | New — admin welcome card with role-gated buttons |
| `src/components/dashboard/KpiCard.tsx` | New — single stat card with icon circle |
| `src/components/dashboard/PayrollBarChart.tsx` | Extract + update from current admin dashboard |
| `src/components/dashboard/DepartmentDonut.tsx` | New — Recharts PieChart wrapper (renders skeleton until endpoint exists) |
| `src/components/dashboard/PendingLeavePanel.tsx` | New — leave approval list with approve + reject-with-reason popover |
| `src/components/dashboard/EmployeeStatusWidget.tsx` | New — stacked bar + 2×2 grid (omitted until endpoint exists) |
| `src/components/dashboard/ProfileCard.tsx` | New — employee profile dark-header card |
| `src/components/dashboard/AttendanceDonut.tsx` | New — employee attendance donut from MonthlySummaryResponse |
| `src/components/dashboard/LeaveBalanceCard.tsx` | New — 2×2 leave balance grid + CTA |
| `src/components/dashboard/LatestPayslipCard.tsx` | New — single payslip hero card |
| `src/components/dashboard/LineManagerTeamTile.tsx` | New — conditional KPI tile for LINE_MANAGER role |
| `frontend/packages/ui/src/utils/formatMoney.ts` | New — `formatMoney(amount, cents?)` utility |
| `frontend/packages/ui/src/utils/formatDate.ts` | New — `formatDate(date)` and `formatTime(date)` utilities |
| `frontend/packages/ui/src/index.ts` | Update — export `formatMoney`, `formatDate`, `formatTime` |

All dashboard components live in `src/components/dashboard/` — local to `tenant-portal`, not promoted to `@andikisha/ui` (they are data-coupled and portal-specific). Formatting utilities are the exception — they go into `@andikisha/ui`.

---

## Decisions flagged for Lawrence before implementation plan

1. **KPI card #1 — Total Employees vs Compliance Status**: Should the first KPI card show total active headcount (passive) or the next statutory filing deadline with days remaining, colour-coded by urgency (actionable, Kenya-specific)? Current spec leaves it as Total Employees. Confirm before plan is written.

2. **Audit-service subscription**: Does `audit-service` already subscribe to `LeaveApprovedEvent` / `LeaveRejectedEvent` from RabbitMQ? If not, what is the correct mechanism for the Pending Leave panel to emit an audit event? Confirm before plan is written.

3. **`x-user-role` header**: The permissive middleware (Prompt A) does not currently set an `x-user-role` response header. Role-gating the "Run Payroll" button and rendering the LINE_MANAGER tile requires reading the role client-side. Options: (a) decode the JWT cookie client-side in a React context; (b) add `x-user-role` to the middleware response headers now. Confirm which approach before plan is written.

---

## Out of scope

- Clock-in / Punch-in functionality (not on roadmap)
- Overtime tracking (not on roadmap)
- Productive hours timeline (not on roadmap)
- Performance ratings widget (not on Phase 1–2 roadmap)
- "Better than X%" attendance percentile footnote (not approved)
- Dynamic onboarding step completion tracking (Prompt B scope)
- Any CRM widgets from the template (Deals, Leads, Projects, Clients)
