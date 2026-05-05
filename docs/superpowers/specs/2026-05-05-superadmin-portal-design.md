# AndikishaHR Superadmin Portal — Design Spec
**Date:** 2026-05-05  
**Status:** Approved  
**Author:** Lawrence Chege  

---

## 1. Overview

A full-stack web portal for AndikishaHR platform operators (superadmins) to manage tenants, subscriptions, compliance configuration, and platform health. Built as a Next.js application at `frontend/superadmin-portal/`.

---

## 2. Scope — Two-Phase Delivery

### Phase 1 (this spec)
Full-stack implementation — frontend UI + backend API gaps.

| Domain | Backend Status |
|--------|---------------|
| Auth & Sessions | Mostly implemented — 4 gaps |
| Tenant Lifecycle | Mostly implemented — 12 gaps |
| Tenant Onboarding | Partially implemented — 18 gaps |
| Plans & Licences | Partially implemented — 8 gaps |
| Feature Flags | Mostly implemented — 7 gaps |
| Audit & Compliance | Partially implemented — 7 gaps |
| Platform Config | Partially implemented — 7 gaps |

### Phase 2 (future)
System Health & Monitoring, Security & Incidents, Billing & Revenue, Support & Ops, Communications, Data Migration, Backup & DR.

---

## 3. Architecture

### Frontend
- **Stack:** Next.js 14 App Router, Tailwind CSS, shadcn/ui
- **Location:** `frontend/superadmin-portal/`
- **Icon set:** Untitled UI Icons (stroke, 24×24, stroke-width 2)

### Auth Flow
1. POST `/api/v1/superadmin/auth/login` → receives SYSTEM-scoped JWT + refresh token
2. Next.js middleware stores both in httpOnly cookies (`sa_access_token`, `sa_refresh_token`)
3. Server components attach `Authorization: Bearer` header on all API calls
4. Middleware guards all `/dashboard/**` routes — redirects to `/login` if missing, silently refreshes if near expiry

### Backend Communication
- **Primary:** Direct calls to `api-gateway` with SYSTEM-scoped JWT
- **Aggregation:** Targeted aggregation endpoints added to `api-gateway` for multi-service screens (e.g. tenant overview = profile + licence + employee count in one call)
- No BFF layer

### Backend gaps for Auth (new endpoints)
- `GET /api/v1/superadmin/auth/sessions` — list active SYSTEM sessions
- `DELETE /api/v1/superadmin/auth/sessions/{id}` — revoke session
- `POST /api/v1/superadmin/auth/rotate-secret` — JWT secret rotation

---

## 4. Visual Design

### Style
Faithful implementation of the Untitled UI dashboard template with full Andikisha branding replacing all purple/indigo accents.

### Color Palette
| Role | Token | Hex |
|------|-------|-----|
| Sidebar bg | `surface` | `#FFFFFF` — **approved final** |
| Sidebar border | `neutral-200` | `#E5E7EB` |
| Active nav bg | `brand-50` | `#E8F5F0` |
| Active nav text/icon | `brand-900` | `#0B3D2E` |
| Active nav border | `amber` | `#E8A020` |
| Section labels | `brand-700` | `#166A50` |
| Primary CTA | `amber` | `#E8A020` |
| CTA hover | `amber-dark` | `#C98510` |
| Main content bg | — | `#F9FAFB` |
| Card bg | `surface` | `#FFFFFF` |
| Card border | `neutral-200` | `#E5E7EB` |
| Body text | `near-black` | `#02110C` |
| Secondary text | `neutral-600` | `#4B5563` |
| Success / active badge | `brand-100` fill / `brand-800` text | `#D1F5E6` / `#0F5040` |
| Warning badge | `amber-light` fill / `amber-dark` text | `#FEF3DC` / `#C98510` |
| Error badge | — | `#FEE2E2` / `#991B1B` |
| Chart bar — active | `brand-500` | `#27A870` |
| Chart bar — new | `brand-900` | `#0B3D2E` |

### Logo
- **Sidebar (light bg):** Default variant — dark wordmark `#02110C`, green mark `#0B3D2E`, amber accent `#E8A020` — height 26px
- **Source:** `frontend/packages/ui/src/components/LogoFull.tsx`

### Shell Layout
```
┌──────────────────────────────────────────────────────┐
│  White Sidebar (280px)  │  Main Content (flex-1)     │
│  ───────────────────    │  ┌───────────────────────┐ │
│  Logo (26px tall)       │  │ Page header (white)   │ │
│                         │  │ Title + search + CTAs │ │
│  GENERAL                │  ├───────────────────────┤ │
│  › Dashboard (active)   │  │ Alert banner (amber)  │ │
│  › Tenants       [48]   │  ├───────────────────────┤ │
│  › Onboarding           │  │ Quick-action tabs     │ │
│                         │  ├───────────────────────┤ │
│  CUSTOMERS              │  │ Content area          │ │
│  › Plans & Licences     │  │ (#F9FAFB background)  │ │
│  › Feature Flags        │  │                       │ │
│                         │  │ Metric cards (4-up)   │ │
│  PLATFORM               │  │ Chart panel           │ │
│  › Audit Log            │  │ Table + pagination    │ │
│  › Platform Config      │  │                       │ │
│                         │  └───────────────────────┘ │
│  ─────────────────      │                            │
│  Settings               │                            │
│  Support  ● Online      │                            │
│  Open in browser ↗      │                            │
│  [LC] Lawrence Chege    │                            │
└──────────────────────────────────────────────────────┘
```

### Sidebar Icons (Untitled UI set)
| Nav item | Icon name |
|----------|-----------|
| Dashboard | `home-line` |
| Tenants | `building-02` |
| Onboarding | `user-plus-01` |
| Plans & Licences | `credit-card-01` |
| Feature Flags | `flag-01` |
| Audit Log | `file-search-01` |
| Platform Config | `settings-01` |
| Settings (footer) | `settings-02` |
| Support (footer) | `help-octagon` |
| Open in browser | `link-external-01` |

### Figma Reference
- File: `umfHtrJLmPEIP5yvHYREcI` (AndikishaHR-Superadmin)
- Dashboard frame: node `1:21634`
- Icon library: node `19:27624` (1,100+ Untitled UI Icons)

---

## 5. Navigation Structure

### Section grouping (final — approved)
```
Dashboard                    ← no section label, floats at top

CUSTOMERS
  Tenants              [48]  ← includes onboarding lifecycle as tab
  Plans & Licences
  Feature Flags

PLATFORM                     ← active Phase 1
  Audit Log
  Platform Config
                             ← Phase 2 locked, "Soon" badge, no section break
  System Health        Soon
  Security             Soon
  Billing & Revenue    Soon
  Communications       Soon
  Support & Ops        Soon

ADVANCED                     ← Phase 2, separate section
  Data Migration       Soon
  Backup & DR          Soon

──────────────── (pinned bottom)
  Settings                   ← auth sessions, JWT rotation
  Support        ● Online
  [Account card — name + email + chevron]
```

### Phase 2 locked items
Items greyed out at 45% opacity with a "Soon" pill badge. No "Coming Soon" section label — the badge is self-explanatory. Zero sidebar restructuring required when Phase 2 ships — just remove the `locked` state.

---

## 6. Dashboard Page

### Page header
- Title: "Dashboard" + subtitle (date + EAT timezone)
- Right: Search bar (⌘K), "Export report" (ghost), "New Tenant" (amber primary)

### Alert banner
- Amber strip — shows count of trials expiring within 48h
- "Review now →" CTA links to Tenants filtered by trial status

### Quick-action tabs
Overview · Tenants · Trials Expiring · Onboarding

### Metric cards (4-up, Figma proportions: ~259px × 106px)
1. Total Tenants — brand gradient top border, growth chip
2. Active Tenants — green gradient top border
3. Trials Expiring (7d) — amber top border, amber value
4. Suspended — red top border, red value

Each card: label (uppercase, 11px) + large value (28px bold) + delta chip + `···` menu

### Tenant Growth Chart
- "View report" ghost button
- Period tabs: `12 months · 3 months · 30 days · 7 days · 24 hours` with green underline active state
- Grouped bar chart: light green (active) + dark green (new) bars per month
- Legend below

### Tenants Table
- Header: "Tenants [48]" + search bar (⌘K) 
- Columns: ☐ · Company (avatar + name + @handle) · Admin email · Created · Status · Employees · Actions
- Row height: 72px (Figma spec)
- Status badges: Active (green) · Trial (light green outline) · Onboarding (amber) · Suspended (red)
- Row actions: trash (red hover) + edit — fade in on row hover
- Pagination: "Showing 1–10 of 48" + Previous · 1 · 2 · 3 · … · 8 · 9 · 10 · Next

---

## 7. Tenants Section (3-Panel Layout)

The Tenants section uses a 3-panel layout — sidebar nav + tenant list + tenant detail panel.

### Tenant list panel
- Filter bar: All / Trial / Active / Suspended / Onboarding tabs
- Search + Filter button
- Sortable table (same columns as dashboard table)
- Click row → slides detail panel open

### Tenant detail panel (right)
- Header: company name + status badge + action menu (Suspend / Reactivate / Impersonate / Delete)
- Tabs: Overview · Onboarding · Employees · Licence · Feature Flags · Audit
- **Overview tab:** company profile, statutory numbers (KRA PIN, NSSF, SHIF), pay schedule, admin contact
- **Onboarding tab:** step progress bar (1/5 → 5/5), checklist items, stall detection
- **Employees tab:** count, last import date, bulk import CTA
- **Licence tab:** plan name, status, seats used/total, trial expiry/renewal date, extend/upgrade actions
- **Feature Flags tab:** toggles per feature, bulk enable/disable
- **Audit tab:** recent actions for this tenant

---

## 8. Micro-interactions

- **Sidebar nav:** left amber border + `#E8F5F0` bg on active; hover lifts bg subtly
- **Tenant status badges:** animate colour transition on status change (suspend → grey, reactivate → green pulse)
- **Table rows:** hover highlight `#F9FAFB`; click selects and slides 3-panel detail open
- **Toasts:** success/error positioned top-right, auto-dismiss 4s
- **Optimistic UI:** feature flag toggles and licence status changes flip immediately, revert on API error
- **Skeleton loaders:** all data-fetching screens use skeleton placeholders — no layout shift
- **Alert banner:** dismissible per session; re-appears if new trials enter 48h window

---

## 9. Backend Gaps to Fill (Phase 1)

### Auth Service
- `GET /api/v1/superadmin/auth/sessions`
- `DELETE /api/v1/superadmin/auth/sessions/{id}`
- `POST /api/v1/superadmin/auth/rotate-secret`

### Tenant Service
- `GET /api/v1/superadmin/tenants?status=&plan=&onboardingStage=&search=` (filtered list)
- `GET /api/v1/superadmin/tenants/{id}/overview` (aggregated: profile + licence + employee count)
- `POST /api/v1/superadmin/tenants/{id}/extend-trial`
- `DELETE /api/v1/superadmin/tenants/{id}` (soft cancel)
- `GET /api/v1/superadmin/tenants/{id}/onboarding` (checklist progress)
- `POST /api/v1/superadmin/tenants/{id}/onboarding/complete`
- `GET /api/v1/superadmin/tenants/{id}/admin-team`
- `POST /api/v1/superadmin/tenants/{id}/invite-admin`
- `POST /api/v1/superadmin/tenants/{id}/resend-invite`

### Plan / Licence Service
- `POST /api/v1/superadmin/plans` (create plan)
- `PUT /api/v1/superadmin/plans/{id}` (update plan)
- `PUT /api/v1/superadmin/tenants/{id}/licence/status` (manual override)
- `GET /api/v1/superadmin/licences/expiring-soon`
- `PUT /api/v1/superadmin/tenants/{id}/seats` (override seat limits)

### Feature Flags
- `GET /api/v1/superadmin/feature-flags/defaults` (global defaults)
- `POST /api/v1/superadmin/feature-flags/keys` (create new flag key)
- `PUT /api/v1/superadmin/feature-flags/{key}/attach-plan` (plan-to-flag mapping)

### Audit Service
- `GET /api/v1/superadmin/audit?tenantId=&domain=&action=&actorId=&from=&to=` (superadmin bypass — no tenant header required)
- `POST /api/v1/superadmin/audit/export` (CSV/PDF report)

### Compliance / Platform Config
- `PUT /api/v1/superadmin/compliance/paye-brackets`
- `PUT /api/v1/superadmin/compliance/nssf-tiers`
- `PUT /api/v1/superadmin/compliance/shif-rate`
- `PUT /api/v1/superadmin/compliance/housing-levy-rate`
- `POST /api/v1/superadmin/compliance/public-holidays`
- `GET /api/v1/superadmin/compliance/validate` (test calculation against known cases)

---

## 10. Testing Strategy

- **Unit:** service logic for each new API endpoint (Mockito)
- **Integration:** repository queries + API endpoint tests with Testcontainers
- **E2E:** Next.js middleware auth flow, tenant list/detail, feature flag toggle, platform config update
- **Visual:** mockup HTML preserved at `.superpowers/brainstorm/` for regression reference
