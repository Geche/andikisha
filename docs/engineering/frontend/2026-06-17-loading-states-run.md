# Loading-state remediation run — closing report

Running report for the skeleton/spinner remediation run. One section per
workstream. Skeleton-vs-spinner decision note is recorded at the end (Gate 2).

---

## W0 — primitive hardening (merged: `05aee21`)

`@andikisha/ui` `Spinner` and `Skeleton` hardened for the run's acceptance bar:
- `prefers-reduced-motion: reduce` fallback (`motion-reduce:animate-none`; spinner
  collapses to a uniform muted ring, skeleton to a static block) — verified rendered
  (computed `animation: none`, all four spinner borders flip to `neutral-300`) by
  toggling macOS Reduce Motion.
- a11y: spinner `role=status` + visually-hidden label + `aria-hidden` arc; skeleton
  `aria-hidden`; new `SkeletonRegion` wrapper (`role=status` + `aria-busy` + sr-label)
  as the single consumption contract.
- Token note: kept `neutral-*` (the run's `canvas`/`surface-hover` semantic names
  **alias** `neutral-50`/`neutral-100` in `packages/ui/src/theme.css` — zero visual
  delta). Spinner arc keeps legacy `brand-700`, deferred to the coordinated alias
  retirement.

Findings filed from W0: `PLATFORM-BACKLOG-003` (dashboard health grid fabricates a
13-service list on error) and a backend finding (system/health UP/UNKNOWN-only status).

---

## W1 — tenant-portal data tables (`b9c3c70`)

Surfaces touched (all consume the verified `Skeleton`/`SkeletonRegion`):

| Surface | Loading | Empty | Error | Notes |
|---|---|---|---|---|
| `admin/users` | skeletons on People table + Roles cards + permission matrix (replaced "Loading…" text) | People-table empty state | People + matrix error states | roles/users queries are **parallel** (not chained) — each region holds its own skeleton, no half-render |
| `my/leave` | balance stat-cards **and** requests table skeleton, gated on one unified `loading` flag | table empty state | distinct table error state + balances error banner | constraint-6 fix: cards no longer render blank above a skeletoned table |
| `my/payslips` | migrated raw `animate-pulse` → verified primitive | "No payslips yet" | distinct error state | — |
| `my/attendance` | migrated raw `animate-pulse` → verified primitive | "No records yet" | distinct error state | error state is what every employee sees today — see FE-BACKLOG-015 |

### Distinct line item — error/empty collision fix (`my/attendance` + `my/payslips`)

Behavioural verification surfaced a **pre-existing constraint-5 violation** in these two
pages that was *not* in the original W1 plan: on a query error they rendered the error
banner **and** the "No records" empty state simultaneously — error collapsing into empty.
W1 split them into a single explicit error state (no empty-on-error, redundant top banner
removed). This is logged separately because it is a correctness change (error ≠ empty),
not part of the skeleton migration it shipped alongside. Re-verified rendered-clean on
`my/attendance` (single explicit error state, no "No records" text).

### Related finding (independent of W1)

`FE-BACKLOG-015` — `my/attendance` 403s for **every** employee due to a BFF proxy
allowlist prefix mismatch (`/api/v1/time-attendance` vs the routed `/api/v1/attendance`).
W1 did not introduce or depend on this; it is why the attendance *error* branch is what
employees currently see. One-line proxy fix tracked separately.

### Verification method

No Slow-3G control in the preview MCP and the app uses axios/XHR (RSC nav uses fetch), so
latency was injected at `XMLHttpRequest.prototype.send` and surfaces were reached via
client-side navigation (preserves the patch, triggers each page's first uncached query).
Rendered evidence: skeleton screenshots (`my/attendance`, `my/leave` two-region), clean
error-state screenshot (`my/attendance`), loaded screenshots (`my/leave`, `admin/users`),
and eval proofs of the verified primitive (`role=status`/`aria-busy` + `motion-reduce`)
with no data leaking through during load.
