# Dashboard Redesign — tenant-portal

**Date**: 2026-05-13  
**Status**: Approved  
**Scope**: `frontend/tenant-portal` — `/admin/dashboard` and `/my/dashboard`  
**Template reference**: `template/smarthr-html/index.html` (admin), `template/smarthr-html/employee-dashboard.html` (employee)  
**Stack**: Tailwind CSS v4, Lucide React, Roboto, brand tokens, Recharts, `@andikisha/ui`  

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
- Left: Avatar circle (initials, brand-900 background) + greeting "Welcome back, [firstName]" + summary line "X pending approvals · Y leave requests" (counts from live API)
- Right: "Export Report" ghost button + "+ Run Payroll" primary button (brand-900, links to `/admin/payroll/new`)

**4 KPI cards** (equal-width, one row)

| # | Label | Value source | Sub-label |
|---|---|---|---|
| 1 | Total Employees | `GET /api/v1/employees?size=1` → `totalElements` | "Active headcount" |
| 2 | Present Today | `GET /api/v1/attendance/today/summary` → `presentCount/totalCount` | Attendance % |
| 3 | Pending Leave | `GET /api/v1/leave/requests?status=PENDING&size=1` → `totalElements` | "Awaiting approval" |
| 4 | Latest Payroll Net | Latest payroll run `totalNet` | Period label + run status badge |

Each card: coloured icon circle (brand accent colours), metric label, large value, sub-label, "View →" link.

**Chart row** (two columns, 60/40 split)
- Left (60%): Payroll Trend bar chart — monthly net payroll, current month highlighted brand-900, prior months brand-100. Period tabs: 12 months / 6 months / 3 months. Built with Recharts `BarChart`.
- Right (40%): Employees by Department — donut chart using Recharts `PieChart`. Segments coloured with brand palette. Legend below. Data from `GET /api/v1/employees/by-department` (if endpoint exists; fall back to a placeholder if not yet implemented — see backend note).

> **Backend note**: `/api/v1/attendance/today/summary` and `/api/v1/employees/by-department` may not yet be implemented. Where an endpoint is missing, the card/chart renders a skeleton with a "Coming soon" label rather than an error state. Do not call non-existent endpoints — check each against the API gateway before wiring.

---

### Lower section

**Full-width: Recent Payroll Runs table**  
Columns: Period · Employees · Gross · Net Pay · Status  
Rows: Last 5 runs, clickable → `/admin/payroll/[runId]`  
Data: `GET /api/v1/payroll/runs?size=5&sort=createdAt,desc`  
"View all →" link in header → `/admin/payroll`

**Two-column row below the table (60/40 split)**

Left (60%) — Pending Leave Approvals  
- Lists up to 5 pending leave requests: employee name, leave type, date range, duration
- Each row: inline **Approve** (brand-100 / brand-900 text) + **Reject** (red-50 / red-700 text) buttons
- On action: calls the leave approval endpoint (verify exact URL against API gateway — likely `PUT /api/v1/leave/requests/{id}/approve` and `PUT /api/v1/leave/requests/{id}/reject`), invalidates the `dashboard-leave-pending` React Query cache
- "Review All →" → `/admin/leave`

Right (40%) — Employee Status  
- Stacked progress bar (Fulltime / Contract / Probation / Part-time), coloured with brand palette
- 2×2 grid of count tiles below: each shows employment type label + headcount
- Data: `GET /api/v1/employees/status-summary` (if not available, skip this widget)

---

## Employee Dashboard — `/my/dashboard`

This layout applies to any authenticated employee-role user. LINE_MANAGER sees the same layout — their My Team section is a separate page (`/my/team`), not a dashboard widget.

### Top row (3 columns — 4/12 · 5/12 · 3/12, matching template's col-xxl-4/5/3)

**Left (4/12) — Profile card**  
- Dark green header (brand-900 background): avatar initials circle + full name + job title · department
- Body: Email address, Employee number, Date of joining
- Data: `GET /api/v1/employees/me`

**Middle (5/12) — Attendance This Month**  
- Donut chart: On time / Late / Absent / On leave — coloured segments (brand-500, amber, red, neutral)
- Centre label: days worked this month
- Legend list on the right of the donut: each category with count
- Footnote: "Better than X% of employees" (omit if data unavailable)
- Data: `GET /api/v1/attendance/me/monthly-summary` — if endpoint absent, render skeleton + "Attendance tracking coming soon"

**Right (3/12) — Leave Balance**  
- 2×2 grid: Annual (remaining) / Sick (remaining) / Taken (YTD) / Pending (count)
- Values from `GET /api/v1/employees/me` + `GET /api/v1/leave/requests/me?status=PENDING&size=1`
- Primary CTA button at bottom: "+ Apply for Leave" → opens leave application form at `/my/leave`

---

### Bottom row (2 columns, 40/60 split)

**Left (40%) — Latest Payslip card**  
- Period label (e.g. "April 2026")
- Large net pay amount (KES formatted)
- Gross and deductions in smaller text
- Status badge (Paid / Draft)
- "View all →" → `/my/payslips`
- Data: `GET /api/v1/payslips?size=1&sort=createdAt,desc`

**Right (60%) — My Leave Requests**  
- Table: Type · Date range · Duration · Status badge
- Last 5 requests
- "Apply + view all →" → `/my/leave`
- Data: `GET /api/v1/leave/requests/me?size=5&sort=createdAt,desc`

---

## Shared implementation rules

- All cards use `bg-surface border border-[#E5E7EB] rounded-xl` — consistent with existing dashboard shells
- Loading states: show skeleton placeholder rows/shapes, not spinners
- Error states per-widget: each card catches its own query error and renders an inline alert — one broken endpoint must not crash the whole page
- Empty states: when data is present but empty (no payroll runs yet, no leave requests), show a muted "Nothing yet" message with a CTA to the relevant page
- Recharts is already in `package.json` — use it for all charts. Do not add a second chart library
- No new dependencies beyond what's already in `tenant-portal/package.json`
- All internal links use the new `/admin/*` and `/my/*` path prefixes

---

## Files to create / modify

| File | Action |
|---|---|
| `src/app/(admin)/admin/dashboard/page.tsx` | Full rewrite |
| `src/app/(my)/my/dashboard/page.tsx` | Full rewrite |
| `src/components/dashboard/WelcomeBanner.tsx` | New — admin welcome card |
| `src/components/dashboard/KpiCard.tsx` | New — single stat card with icon circle |
| `src/components/dashboard/PayrollBarChart.tsx` | Extract from current admin dashboard |
| `src/components/dashboard/DepartmentDonut.tsx` | New — Recharts PieChart wrapper |
| `src/components/dashboard/PendingLeavePanel.tsx` | New — leave approval list with inline actions |
| `src/components/dashboard/EmployeeStatusWidget.tsx` | New — stacked bar + 2×2 grid |
| `src/components/dashboard/ProfileCard.tsx` | New — employee profile dark-header card |
| `src/components/dashboard/AttendanceDonut.tsx` | New — employee attendance donut |
| `src/components/dashboard/LeaveBalanceCard.tsx` | New — 2×2 leave balance grid + CTA |
| `src/components/dashboard/LatestPayslipCard.tsx` | New — single payslip hero card |

All components live in `src/components/dashboard/` — local to `tenant-portal`, not promoted to `@andikisha/ui` (they are data-coupled and portal-specific).

---

## Out of scope

- Clock-in / Punch-in functionality (not on roadmap)
- Overtime tracking (not on roadmap)
- Productive hours timeline (not on roadmap)
- Performance ratings widget (not on Phase 1–2 roadmap)
- Any CRM widgets from the template (Deals, Leads, Projects, Clients)
