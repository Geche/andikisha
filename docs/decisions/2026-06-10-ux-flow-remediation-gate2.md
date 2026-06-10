# UX & Flow Remediation — Gate 2 Closing Report

**Date:** 2026-06-10
**Branch:** `fix/ux-flow-remediation-01` — **unmerged, ready for review** (16 commits ahead of `master`)
**Scope:** Run 01 (W0–W5) + Run 02 (R2-1 … R2-10) + two browser-pass bug fixes (Bug 1, Bug 2)

> **Branch-name note (accurate history, not a deviation):** the Run 02 authorization specified a
> separate branch `fix/ux-flow-remediation-02`. Execution kept everything on
> `fix/ux-flow-remediation-01` because Run 01 had not merged and Run 02 sequenced **on top of** it
> (not parallel to it). Renaming/splitting after the fact would only paper over what happened. One
> branch, both runs, reviewed together.

---

## 1. Workstream ledger

| Item | Summary | Commit | Status |
|---|---|---|---|
| W0 | Gateway licence-check read-through, asymmetric fail (reads fail-open+audit, writes fail-closed) | `ddbbc26` | ✅ |
| W1 | Landing: flag-gate login (`NEXT_PUBLIC_SHOW_LOGIN`), de-price pricing | `1d28c82` | ✅ |
| W2 | Landing: contact form enhancement, v3 tokens | `de9f6bb` | ✅ |
| W3 | Terminate employee POST-not-PATCH (405-as-500) | `3cfe4cf` | ✅ |
| W4 | Logout revokes server-side refresh tokens; filed 405-masking + refresh-409 backlogs | `731e6d1`, `146bf70` | ✅ |
| W5 | Expose bulk upload; placeholder collision fix; lock required-fields test | `1932f8a`, `15f3501` | ✅ |
| R2-1 | Dashboard "1 error" badge — keystone | _(no code)_ | ✅ browser-confirmed clean (stale-bundle, cleared by tenant-portal restart) |
| R2-2 | Inactivity timeout both portals | _(no code)_ | ✅ browser-confirmed (already implemented; fires + redirects) |
| R2-3 | Wire payroll calc to Compliance (public endpoint); home-page accuracy | `38cc722` | ✅ browser-confirmed (calc computes live, accordions clickable) |
| R2-4 | Pricing on accuracy-audited taxonomy + roadmap strip (price-free) | `54345e2` | ✅ |
| R2-5 | `/admin/settings` departments + positions; filed positions-edit asymmetry | `2255fba`, `944bb86` | ✅ |
| R2-6 | BFF proxy binary upload/download fix (xlsx corruption) | `eaefac9` | ✅ |
| R2-7 | Platform statutory edit + **record-only** plan change | `8e92651` | ✅ |
| R2-8 | Permissions UI — roles matrix + central assignment | `b7d891b`, `9606874` | ✅ |
| R2-9 | Post-auth cookie race → blank login (full-document nav fix) | `dfb3d60` | ✅ browser-confirmed (lands on dashboard first try) |
| R2-10 | Discoverable RBAC-gated User management | `05b2c06` | ✅ browser-confirmed (visibility ADMIN/HR_MANAGER vs EMPLOYEE) |
| Bug 1 | Leave approve/reject POST-not-PATCH + reject field | `864cd82` | ✅ browser-confirmed (approve + reject succeed) |
| Bug 2 | User-management modals white-card wrapper | `082dd02` | ✅ browser-confirmed (centered, backdrop, no bleed) |
| Bug 3 | Leave "View" link missing `/{workspace}/admin` prefix → 404 | `1250348` | ✅ verified (old→404, new→200); browser confirm approved+rejected |
| — | Backlog filings (delete actions, Settings IA, leave notes, BaseModal trap) | `62a1937` + this report's commit | ✅ |

---

## 2. R2-9 — corrected diagnosis (and the process lesson)

**Initial call was wrong.** I first closed R2-9 as a stale bundle. Browser evidence (URL stuck at
`/{workspace}/login`, `401 on /api/auth/me`, soft-refresh fixes it) proved it was an auth/cookie bug.

**Actual root cause:** the post-login `fetch` sets `tenant_token` on its response, then the page did a
**soft `router.replace(dashboard)`**. That soft navigation's RSC request races the cookie commit, so
middleware sees no token and bounces to `/login`. A hard refresh is a full document request that carries
the cookie → which is exactly *why refresh fixed it*. The `/api/auth/me` 401 was the `CurrentUserProvider`
firing on the landed `/login` page — a symptom, not the cause. Fix: full-document navigation
(`window.location.assign`) after auth, in both login and set-password.

**Top-level process lesson — `curl` masks browser cookie-timing bugs.** My server-side `curl` checks
all passed because **curl reuses the cookie jar serially** — once the login response sets the cookie, curl
sends it on every subsequent request, so it can never reproduce the browser's *first-request-after-redirect*
failure. Trusting a green curl over the actual browser symptom is what produced the wrong first call.
**Standing rule going forward:** for any auth/redirect/cookie symptom, curl proves the server contract but
**only a real browser (or a fresh, cookie-less client per request) proves the navigation**.

---

## 3. Audit-during-build catches

Problems found *while doing the named work* — the discipline reliably surfaced adjacent defects, not just
the item in front of it:

1. **Matrix-tenant query bug (R2-8)** — the roles matrix first queried the caller's (empty) tenant instead
   of the `SYSTEM` RBAC template; caught by checking the returned data, not just the 200.
2. **PricingComparisonTable sibling claim (R2-4)** — the comparison table still advertised "KRA filing
   (P10A/P9)", which is roadmap, not shipped; corrected to "Housing Levy calculated".
3. **Home-page SMS/WhatsApp/USSD copy (R2-3)** — FeatureComplianceGrid + ProductWalkthrough claimed
   payslip-delivery channels that aren't shipped; reworded to the self-service PWA reality.
4. **Dead `HeroPayslipCard.tsx` (R2-3)** — an unused component depending on the deleted hardcoded-rates
   module; removed.
5. **Endpoint 403-masking-400 diagnostic chain (R2-3)** — the public Compliance endpoint first 403'd; it
   was actually a masked **400** from the `TenantInterceptor` requiring `X-Tenant-ID` on the anonymous
   path (plus a stale jar). Fixed by permitting + excluding the public path.
6. **R2-8 ADMIN-only over-restriction (caught during the R2-10 audit)** — the R2-8 screen gated the whole
   view ADMIN-only in the UI, so HR_MANAGER — whom the backend authorises — couldn't see it. A real
   defect, not just an R2-10 nav change. Relaxed to ADMIN + HR_MANAGER in R2-10.
7. **Leave PATCH/POST = the W3 terminate pattern, predicted by the W4 backlog (Bug 1)** — leave
   approve/reject failed for the identical reason as W3's terminate (frontend PATCH vs backend POST, 405
   masked as 500). The W4 backlog doc (`method-not-allowed-masked-500`) flagged this masking as
   cross-cutting; Bug 1 is a concrete second instance of it.

---

## 4. Changes to established behaviour (for future engineers)

- **W0 — licence read-through is asymmetric.** On a Redis licence-cache miss the gateway reads
  through; **reads fail-open + audit, writes fail-closed**, and an explicit `NONE` is blocked. Don't
  "simplify" this to symmetric fail without re-reading the decision doc.
- **W5 — V10 made `employees.nhif_number` / `national_id` nullable.** Placeholder/pending-activation
  rows are now valid at the DB layer; the **NOT NULL enforcement moved to the application boundary**
  (single-create still requires them; bulk/placeholder paths don't). Compliance filings must therefore
  filter out placeholder rows — see the payroll-eligibility backlog doc.
- **R2-3 — there is now a PUBLIC, unauthenticated endpoint:** `GET /api/v1/public/compliance/{country}/rates`
  (rate data, not a computed payslip). It is permitted in compliance security and **excluded from the
  tenant interceptor**. Anyone can call it; keep it rate-data-only.
- **R2-7 — the platform plan change is RECORD-ONLY.** It updates plan/seats/price via the
  status-preserving upgrade path and **does not** transition licence status or clear the trial. Entitlement
  enforcement is deliberately deferred (TENANT-BACKLOG-003).
- **R2-9 — post-auth navigation pattern changed.** Login and set-password now use
  `window.location.assign` (full document load), **not** `router.replace`, so the freshly-set cookie rides
  the next request. Do not "optimise" these back to soft client navigation.

---

## 5. Caching window (R2-3) — operational fact

Layers: compliance endpoint `Cache-Control: max-age=21600` (6h); the landing Next route fetches with
`revalidate=86400` (24h Data Cache, dominant) and serves `max-age=21600, stale-while-revalidate=86400`.
**Worst case on a Finance-Bill day: ~24h dominant (Next Data Cache), up to ~48h for a returning visitor**
(browser SWR tail layering on the server cache). Acceptable for a marketing calculator; far better than the
prior never-updating drift. **Tightening lever:** lower `revalidate`, or fire an on-demand revalidate /
cache purge as part of the rate-update deploy.

---

## 6. Backlog filed this run

| ID | Summary | Where |
|---|---|---|
| EMP-BACKLOG-003 | No update endpoint for positions (asymmetric with departments) | `docs/backlog/BACKLOG.md` |
| TENANT-BACKLOG-003 | extendTrial updates trialEndsAt not licence.endDate — full divergence diagnosis attached (enforcement-deferred) | `docs/backlog/BACKLOG.md` |
| TENANT-BACKLOG-004 | No backend format validation for tenant statutory fields (KRA PIN/NSSF/SHIF) | `docs/backlog/BACKLOG.md` |
| TENANT-BACKLOG-005 | User deactivation — no endpoint | `docs/backlog/BACKLOG.md` |
| TENANT-BACKLOG-006 | Standalone user invite (separate from employee-tied provisioning) | `docs/backlog/BACKLOG.md` |
| TENANT-BACKLOG-007 | Delete actions on Departments/Positions/Roles — **Run 03** (data-integrity decision) | `docs/backlog/BACKLOG.md` |
| TENANT-BACKLOG-008 | Settings IA reorganization — **Run 03** (taxonomy needs design) | `docs/backlog/BACKLOG.md` |
| LEAVE-BACKLOG-001 | Approve does not persist reviewer notes | `docs/backlog/BACKLOG.md` |
| FE-BACKLOG-007 | BaseModal silent-empty-modal trap (require/default the surface wrapper) | `docs/backlog/BACKLOG.md` |
| (405-masked-as-500) | Catch-all advice masks 405 as 500 across services — cross-cutting | `docs/Engineering/backend/2026-06-09-method-not-allowed-masked-500-backlog.md` |
| (/auth/refresh 409) | Refresh-token rotation returns 409 on concurrent refresh | `docs/Engineering/backend/2026-06-09-refresh-token-409-rotation-backlog.md` |
| (payroll eligibility) | Pending-activation/placeholder rows must be excluded from filings/payroll | `docs/Engineering/backend/2026-06-09-pending-activation-payroll-eligibility-backlog.md` |

EMP-BACKLOG-002 (nullable NHIF/national_id) was **resolved** this run (W5).

---

## 7. Decision / engineering docs written this run

- `docs/decisions/2026-06-08-licence-read-through.md` — W0/D1 read-through + asymmetric fail policy.
- `docs/Engineering/backend/2026-06-09-method-not-allowed-masked-500-backlog.md`
- `docs/Engineering/backend/2026-06-09-refresh-token-409-rotation-backlog.md`
- `docs/Engineering/backend/2026-06-09-pending-activation-payroll-eligibility-backlog.md`
- `docs/Engineering/frontend/2026-06-05-gap-audit-correction.md` — updated.

> **Honest gap:** only the licence read-through has a standalone *decision* doc. The other approved
> decisions (D2–D5; R2-3 public-endpoint shape; R2-7 record-only) live in commit messages + the Gate
> records, not separate docs. Happy to backfill formal decision docs for R2-3 and R2-7 if wanted.

---

## 8. Verification summary

- **Backend:** auth-service, tenant-service, compliance-service suites green; targeted reproductions
  (PATCH→500 / POST→200 for approve; reject `{notes}`→400 / `{rejectionReason}`→200; record-only plan
  change leaves status TRIAL; EMPLOYEE→`/users` 403, ADMIN/HR_MANAGER→200; public rates 200 + cached).
- **Frontend:** `tsc --noEmit` clean across landing, tenant-portal, platform-portal.
- **Browser-confirmed by the reviewer:** R2-1 (clean console, badge gone), R2-2 (idle redirect both
  portals), R2-3 (live calc + accordions), R2-9 (login → dashboard first try), R2-10 (per-role nav
  visibility + screen render), Bug 1 (approve/reject succeed), Bug 2 (modals centered with backdrop).

**Test accounts (gitignored `config/env/tenant-verify.env`):** `admin@demo.co.ke` (ADMIN,
`mustChangePassword` cleared), `hrmanager@demo.co.ke` (HR_MANAGER, provisioned this run — standalone
user with a dangling `employee_id`, see TENANT-BACKLOG-006), `jane.w@demo.co.ke` (EMPLOYEE),
`superadmin@andikisha.com` (SUPER_ADMIN).

---

## 9. Review & merge

Branch `fix/ux-flow-remediation-01` is **unmerged**. Recommended review order: W0 (licence policy) →
R2-3 (public endpoint surface) → R2-7 (record-only) → R2-9 (auth nav) → R2-8/R2-10 (RBAC) → the rest.
Run 03 candidates (TENANT-BACKLOG-007/008) are explicitly out of this run.
