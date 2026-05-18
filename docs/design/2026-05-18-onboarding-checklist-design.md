# Onboarding Checklist — Design Document

**Scope:** Replaces the empty admin dashboard for new tenants until all 4 setup steps are complete.

---

## A. State Machine

The dashboard route (`/admin/dashboard`) determines which view to render on every load by calling three existing endpoints in parallel:

```
GET /api/v1/departments          → count > 0  → step 1 complete
GET /api/v1/positions            → count > 0  → step 2 complete
GET /api/v1/employees            → count > 0  → step 3 complete
GET /api/v1/payroll-runs         → count > 0  → step 4 complete
```

No new backend fields. State is fully derived.

**Render decision:**

| Condition | View |
|-----------|------|
| All 4 counts > 0 | Standard dashboard |
| Any count = 0 | Onboarding checklist |

**Edge cases:**

- **Departments but no employees (step 3 incomplete):** Steps 1–2 show as complete (checkmark), step 3 is the active step, step 4 is locked (dimmed, no action button).
- **Employees but no payroll runs (step 4 incomplete):** Steps 1–3 complete, step 4 is the active step. This is the expected path for most new tenants.
- **Positions populated, departments empty:** Impossible via the UI (positions seeding implicitly satisfies departments check since both are seeded together), but if it occurs via direct API, step 1 shows incomplete and step 2 shows complete. Checklist renders normally — each step is evaluated independently.
- **Existing tenant, partial setup:** Checklist renders on next dashboard load. Already-complete steps show with checkmarks and a "View" link. No data is reset or lost.

---

## B. Visual Layout

Single `<section>` below the welcome header. Four step cards stacked vertically in a single column, full width. No sidebar split.

Each step card structure (using existing `@andikisha/ui` primitives):

```
┌──────────────────────────────────────────────────────────┐
│  [●] 1  Add departments                         [✓ done] │
│       Departments group employees and structure           │
│       your payroll reports.                               │
│                                                           │
│       [Use suggested defaults]  [Add custom department]   │
└──────────────────────────────────────────────────────────┘
```

**Active step** (current "next action"): card has a `border-brand-600` left accent (4px solid), background `surface`, full opacity, action buttons visible.

**Complete step**: card background `surface-alt`, checkmark icon (`CheckCircle` from Lucide, `text-brand-600`), action buttons replaced by summary line + `View` link. Full opacity — still readable.

**Locked step** (incomplete prerequisite before it): card background `surface-alt`, step number circle `text-neutral-300`, description text `text-neutral-400`, no action buttons. Steps 3 and 4 are never locked simultaneously — only the step immediately after the last incomplete one is active.

Primitives used: `Card` (from `@andikisha/ui`), `Button` (variant `primary` for defaults, variant `outline` for custom), `Badge` (for "complete" label if needed). No new components needed for the card shell.

---

## C. Step Content

**Step 1 — Add departments**
> "Departments group employees and structure your payroll reports."
- Primary: `Use suggested defaults` → seeds HR, Finance, Operations, Engineering, Sales via `POST /api/v1/departments/seed-defaults`
- Secondary (outline): `Add custom department` → navigates to `/admin/settings/departments`
- Complete state: "5 departments created" · [View departments →]

**Step 2 — Add positions**
> "Positions define job titles and grade levels."
- Primary: `Use suggested defaults` → seeds 10 common roles via `POST /api/v1/positions/seed-defaults`
- Secondary (outline): `Add custom position` → navigates to `/admin/settings/positions`
- Complete state: "{n} positions created" · [View positions →]

**Step 3 — Add your first employee**
> "Create an employee record with their personal, statutory, and salary details."
- Primary: `Add employee` → navigates to `/admin/employees/new`
- No "suggested defaults" option.
- Complete state: "{n} employees added" · [View employees →]

**Step 4 — Run your first payroll**
> "Calculate payroll, review payslips, and disburse via M-Pesa."
- Primary: `Run payroll` → navigates to `/admin/payroll/new`
- No "suggested defaults" option.
- Complete state: "First payroll run complete" · [View payroll →]

**Seed endpoint contract** (same data as `make seed-demo-data`):
- Departments: HR, Finance, Operations, Engineering, Sales
- Positions: 10 common roles (Software Engineer, HR Officer, Finance Manager, Operations Manager, Sales Executive, Data Analyst, Customer Support, Product Manager, QA Engineer, UI/UX Designer)
- These endpoints must be idempotent — re-running does not duplicate records.

---

## D. Transition Behaviour

When the `/admin/dashboard` route loads and all four counts are > 0, the standard admin dashboard renders. No animation, no celebration modal. The URL does not change. The transition is invisible to the user except that the welcome header and checklist are gone.

The checklist state is not persisted. Every dashboard load re-derives it from the four API calls. There is no "dismiss" or "skip" option.

---

## E. Header Treatment

**Checklist visible:**
```
Welcome to AndikishaHR          ← page title (h1)
Let's get your workspace set up. ← subtitle (p, text-neutral-500)
```

**Checklist hidden (standard dashboard):**
```
Dashboard                        ← standard page title
```

Both use `<PageHeader>` from `@andikisha/ui`. No structural changes to `PageHeader`.

---

## F. Mobile

All step cards stack full width. Within each card, action buttons stack vertically, full width (`w-full`). Step number, title, and description remain single-column. Tailwind breakpoint: default (mobile-first), override at `sm:` for side-by-side buttons on larger screens.

---

## G. Empty States Within Steps

A step that is **incomplete** (active): shows description + action buttons. No count.

A step that is **complete**: replaces action buttons with a summary line:
- `{n} departments created` (or positions, or employees)
- `First payroll run complete` (for step 4)
- Followed by a plain-text link: `View →` pointing to the relevant list page.

A step that is **locked** (prerequisite not met): shows description only, greyed out. No buttons, no summary, no "View" link.
