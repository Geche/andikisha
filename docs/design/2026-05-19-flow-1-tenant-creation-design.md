# Flow 1: Tenant Creation UI — Design

**Date:** 2026-05-19  
**Scope:** Two pages in platform-portal — `/tenants` (list) and `/tenants/new` (create form).  
**Audit reference:** `docs/audit/2026-05-19-flow-1-tenant-creation-audit.md`

---

## Decision: Unbuilt Nav Items

The nav has 9 top-level items beyond Dashboard and Tenants, all pointing to unbuilt pages. **Decision needed before implementation begins.**

| Option | Description |
|---|---|
| **A — Show all, crash gracefully** | Links render normally; clicking an unbuilt route shows Next.js 404 |
| **B — Disable unbuilt items** | Links are visually muted (`opacity-40 cursor-not-allowed`), no click action |
| **C — Hide unbuilt items** | Nav only shows Dashboard and Tenants until each page ships |

Recommendation: **B** — keep the nav visible for orientation (SUPER_ADMIN can see the product roadmap in the nav), but prevent dead links from creating confusion. Implementation: wrap each unbuilt `href` in a check against a `BUILT_ROUTES` constant; if not built, render a `<span>` instead of `<Link>` with `title="Coming soon"` and reduced opacity.

**Lawrence must confirm A, B, or C before implementation.**

---

## Page 1: `/tenants` — Tenant List

### Layout

```
PageHeader (title="Tenants", action=<Button href="/tenants/new">Provision Tenant</Button>)
────────────────────────────────────────────────────────────────────────
[Status tabs: All | Active | Trial | Suspended | Cancelled]
[DataTable]
```

The `PageHeader` action slot renders the "Provision Tenant" button top-right, consistent with how the dashboard page title appears.

### Status Tabs

Five tabs above the table. Clicking a tab sets a `status` query param and re-fetches. The "All" tab clears the filter. Tab counts come from the query result's `totalElements` — the tab bar does not make separate count requests.

```
All (totalElements) | Active | Trial | Suspended | Cancelled
```

Active tab is underlined with `brand-700` border. Inactive tabs use `neutral-500` text.

### DataTable Columns

| Column | Source field | Notes |
|---|---|---|
| Organisation | `organisationName` | Bold, clickable — navigates to `/tenants/{tenantId}` |
| Status | `status` | `Badge` component: ACTIVE→`approved`, TRIAL→`calculating`, SUSPENDED→`cancelled`, CANCELLED→`cancelled` |
| Plan | `planName` | Plain text |
| Seats | `seatCount` | Right-aligned; `—` if null |
| Trial/End date | `endDate` | `DD MMM YYYY`; `—` if null |
| Admin email | `adminEmail` | Truncated at 180px |
| Joined | `createdAt` | `DD MMM YYYY` |

No employee count column (not available without cross-service call; see audit §1.2).  
No search input (server-side search not implemented; see audit §1.2 gap).

### Pagination

Standard Spring `Page` response. Show page size selector (10 / 25 / 50). DataTable receives `page`, `size`, and `totalElements` and renders a simple prev/next row count indicator: `Showing 1–10 of 47`.

### Row Click

Every row is clickable. Click navigates to `/tenants/{tenantId}`. The detail page is a stub for now — it ships as part of the Flow 1 implementation alongside the list and create pages, not as a separate flow.

### Empty State

When `totalElements === 0` and no status filter is active:

```
[Building icon]
No tenants yet
Provision the first tenant to get started.
[Button: Provision Tenant → /tenants/new]
```

When `totalElements === 0` and a status filter is active:

```
No tenants with status "{status}" found.
```

### Data Fetching

```typescript
queryKey: ["tenants", { page, size, status }]
queryFn: () => apiClient.get("/api/v1/super-admin/tenants", { params: { page, size, sort: "createdAt,desc", status } })
```

No auto-refresh on this page. Stale-while-revalidate on focus (`refetchOnWindowFocus: true`).

---

## Page 2: `/tenants/new` — Create Tenant Form

### Layout

```
PageHeader (title="Provision Tenant")
────────────────────────────────────────────────────────────────────────
[Form card — max-w-2xl, centred]
  Organisation details section
  Admin account section
  Licence section
  [Submit button]
```

Single card, two-column grid on `md+` for short fields, full-width for long fields. No stepper — this is a one-screen form.

### Form Sections and Fields

#### Section 1 — Organisation

| Field | Input | Validation |
|---|---|---|
| Organisation name | `<input type="text">` | Required, max 200 chars |

#### Section 2 — Admin Account

| Field | Input | Validation |
|---|---|---|
| First name | `<input type="text">` | Required, max 100 |
| Last name | `<input type="text">` | Required, max 100 |
| Email address | `<input type="email">` | Required, valid email |
| Phone number | `<input type="tel">` | Required, Kenya format: `+2547XXXXXXXX` or `07XXXXXXXX` |

Phone hint text below the field: `Format: 07XXXXXXXX or +2547XXXXXXXX`

#### Section 3 — Licence

| Field | Input | Notes |
|---|---|---|
| Plan | `<select>` | Options fetched from `GET /api/v1/plans`. Label: `{name} — KES {monthlyPrice}/mo`. Selecting a plan pre-fills `Agreed price` |
| Billing cycle | `<select>` | Options: `Monthly`, `Annual` |
| Seat count | `<input type="number" min="1">` | Required |
| Agreed price (KES) | `<input type="number" step="0.01" min="0">` | Pre-filled from plan `monthlyPrice` on plan select; editable override |
| Trial days | `<input type="number" min="0">` | Default `0` (no trial). `0` = ACTIVE on creation. Any value > 0 = TRIAL status |

Trial days hint: `0 = no trial (tenant activates immediately). Enter days for a trial period.`

Plans are fetched once on page mount via React Query. If plans fail to load, the select renders a disabled state with an inline error and the submit button is disabled.

### Form State

Built with React `useState` per field (no form library). Client-side validation runs on submit, not on blur, to avoid premature errors.

Error display: field-level `<p className="text-xs text-error mt-1">` beneath each failing field. A top-level `InlineAlert variant="error"` for 409 conflicts (duplicate email / org name) and for 5xx errors.

Submit button text: `Provision Tenant`. Disabled and shows spinner while the request is in flight.

### Success Modal

On `201 Created`, a modal overlays the page (does not navigate away).

```
┌─────────────────────────────────────────────────┐
│  Tenant Provisioned                          ✕   │
│                                                   │
│  {organisationName} has been set up.              │
│                                                   │
│  Plan          {planName}                         │
│  Licence       {licenceStatus}                    │
│  Seats         {seatCount}                        │
│  End date      {endDate ?? "—"}                   │
│  Admin email   {adminEmail}                       │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Temporary Password                          │  │
│  │  {temporaryPassword}          [Copy]         │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ⚠  Share this password with the admin now.       │
│     It will not be shown again and cannot          │
│     be retrieved from the system.                  │
│                                                   │
│           [Provision Another]  [Go to Tenants]    │
└─────────────────────────────────────────────────┘
```

**Copy button:** Writes `temporaryPassword` to clipboard via `navigator.clipboard.writeText()`. Button label toggles to `Copied ✓` for 2 seconds.

**"Provision Another":** Closes modal, resets form to empty state, stays on `/tenants/new`.

**"Go to Tenants" / close (✕):** Navigates to `/tenants`. React Query cache for `["tenants"]` is invalidated on modal close so the list refreshes.

The modal cannot be closed by clicking outside — the password warning requires a deliberate action.

---

## Page 3: `/tenants/{tenantId}` — Tenant Detail (stub)

Ships with Flow 1 but only as a stub:

```
PageHeader (title="{organisationName}" or "Tenant")
────────────────────────────────────────────────────
[InlineAlert variant="info"]
  This page is under construction.
[Button: ← Back to Tenants]
```

The `tenantId` from the URL is used in the `PageHeader` title once a `GET /api/v1/super-admin/tenants/{tenantId}` call resolves. Full detail UI is a separate flow.

---

## File Map

| File | Action |
|---|---|
| `src/app/(platform)/tenants/page.tsx` | Create — list page |
| `src/app/(platform)/tenants/new/page.tsx` | Create — create form |
| `src/app/(platform)/tenants/[tenantId]/page.tsx` | Create — detail stub |
| `src/components/tenants/TenantStatusTabs.tsx` | Create — status filter tabs |
| `src/components/tenants/ProvisionTenantForm.tsx` | Create — form + submit logic |
| `src/components/tenants/ProvisionSuccessModal.tsx` | Create — success modal |

All files live in platform-portal (`frontend/platform-portal/src/`). No changes to `@andikisha/ui` — all components here are Tier 3 (domain-coupled) and belong in the app.

---

## Open Questions

1. **Nav unbuilt items:** Option A, B, or C? (Decision required before implementation — see top of this doc.)
2. **Tenant detail page scope:** Confirmed as stub for Flow 1. Full detail (licence history, suspend/reactivate, extend trial) is a separate flow — correct?
3. **`agreedPriceKes` — annual pricing:** When billing cycle = ANNUAL, should the pre-filled price be `monthlyPrice × 12`? Or does the SUPER_ADMIN always enter the annual total manually?
