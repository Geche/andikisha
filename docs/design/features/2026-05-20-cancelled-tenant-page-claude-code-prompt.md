# Claude Code Prompt — Cancelled Tenant Page

Fix the last open functional bug on the tenant detail surface. A cancelled tenant currently shows "Tenant not found or failed to load. It may have been deleted." with a red error toast. The tenant is not gone. It was cancelled and its record is retained for compliance. The page must show the cancellation as a read-only retention record, not a load failure.

Design doc: `docs/design/features/2026-05-20-cancelled-tenant-page-design.md` (companion to this prompt). Read it before starting.

Be faithful to the existing platform-portal UI. This is a state of the existing tenant detail page, not a new page built from scratch. Reuse the existing components, layout, spacing, and brand tokens. Do not introduce new colours, new spacing scales, or new patterns.

---

## Step 0 — Diagnostic first (read-only, stop and report)

The fix path forks here. Before changing anything, confirm what the backend returns for a cancelled tenant.

Call the detail endpoint with a SUPER_ADMIN token against a known cancelled tenant:

```
GET /api/v1/super-admin/tenants/{cancelledTenantId}
```

Report which outcome you get:

- **Outcome A:** 404 or 403. The service filters CANCELLED out of single-tenant fetches. Fix needs a backend change so the detail fetch returns cancelled tenants (the list endpoint may keep filtering them).
- **Outcome B:** 200 with the tenant data. The frontend is treating `status === 'CANCELLED'` as an error. Fix is frontend only.

Also report the shape of the licence history in the response, specifically whether the cancellation event carries a timestamp, an actor (who cancelled), and an optional reason. The cancellation banner needs these.

Stop and report before proceeding. Do not start Step 1 until the outcome is confirmed.

---

## Step 1 — Backend, only if Step 0 returned Outcome A

If the detail endpoint rejects cancelled tenants, change the single-tenant fetch so it returns them. The list and filter endpoints may continue to exclude CANCELLED, but `GET /api/v1/super-admin/tenants/{id}` must return a cancelled tenant with full data and its licence history.

Do not change anything about how cancellation itself works. The state machine, the soft-delete, the retention behaviour all stay as they are. This step only widens what the detail fetch is allowed to return.

If Step 0 returned Outcome B, skip this step.

---

## Step 2 — Error-message split

The current message conflates three situations into one string. Split them. A cancelled tenant must never reach an error state.

| Situation | Detection | Behaviour |
|---|---|---|
| Cancelled tenant | Fetch succeeds and `status === 'CANCELLED'` | Render the cancelled tenant page (Step 3). No error, no toast. |
| Genuine 404 | Fetch returns 404, ID was never a tenant | "No tenant with this ID exists." plus a link back to All Tenants. |
| Transient failure | 5xx or network error | "Couldn't load this tenant. Try again." plus a retry control. |

The 404 and transient cases keep an error treatment. The cancelled case does not.

---

## Step 3 — The cancelled tenant page

A read-only retention record. Reuse the existing tenant detail shell and components. Top to bottom:

### 3.1 Cancellation banner

First element, above the identity strip. Muted neutral surface with a left border, NOT the red error component. Red is reserved for the genuine errors in Step 2.

One line with the essentials, date and actor pulled from the cancellation event in licence history:

> This tenant was cancelled on 18 May 2026 by superadmin@andikisha.com.

If a reason was captured, show it below that line. If the actor or reason is missing from the data, degrade gracefully (omit the missing part, do not render "by undefined").

### 3.2 Identity strip

Same layout as the active page: organisation name, admin email, admin phone, tenant ID, workspace, created date. The status badge reads CANCELLED in a muted neutral treatment. Do NOT use brand-500 green (reserved for confirmation states) and do NOT use trial amber. Keep the workspace visible.

### 3.3 Licence history timeline

Move this up in priority. On a cancelled tenant it is the centrepiece. Show the full arc in chronological order, ending in the cancellation event with its timestamp and actor. Reuse the existing licence history component.

### 3.4 Retention statement

Explicit retention line. Compute cancellation date plus seven years:

> Data retained until 18 May 2033 per KRA record-keeping requirements.

### 3.5 Retained data acknowledgement (display only)

A short statement, no browsing UI for V1:

> Employee and payroll records for this tenant are retained and available on request.

---

## Step 4 — Actions

Render only one action. Hide the rest.

- **Reset admin password — keep.** The single available action. The endpoint already works for cancelled tenants. Use the existing button component (amber, the only interactive colour). Label it "Reset password for historical data access." On success, surface the temp password exactly as the active tenant flow does.
- **Reactivate — do not render.** CANCELLED is terminal.
- **Suspend, extend trial, change plan — do not render.** They would fail or make no sense.

---

## Step 5 — Brand and token fidelity

- Reuse existing components and layout. The cancelled page is a state of the tenant detail page, not a rebuild.
- Amber is the only colour on interactive buttons.
- brand-500 green stays reserved for success and confirmation. The CANCELLED badge is muted neutral, not green.
- near-black text, surface-alt for any alternating section, neutral-* for muted text and borders.
- Token discipline: no raw hex, no gray-* classes. Use the semantic tokens and neutral-* scale already in the portal.
- Roboto, inherited from the existing layout.
- The cancellation banner is a muted neutral surface with a left border, never the red error styling.

---

## Step 6 — Verification

1. Record the Step 0 diagnostic outcome.
2. Load a cancelled tenant. The cancellation banner shows the correct date and actor from licence history. No red error toast.
3. The status badge reads CANCELLED in muted neutral, not green or amber.
4. The licence history timeline shows the full arc ending in the cancellation event.
5. The retention statement shows cancellation date plus seven years.
6. The only action is reset admin password. No reactivate, suspend, extend, or change plan.
7. Reset admin password works against the cancelled tenant and surfaces the temp password.
8. Load a random non-existent UUID. The page shows "No tenant with this ID exists," not the cancelled layout.
9. Simulate a 5xx or network failure. The page shows "Couldn't load this tenant. Try again." with a retry, not the cancelled layout and not the not-found message.
10. Confirm the page reuses existing components and tokens. No new colours, no raw hex, no gray-* classes.

---

## Sequence

1. Step 0 diagnostic. **Stop and report the outcome and the licence history shape before continuing.**
2. Step 1 backend, only if Outcome A.
3. Steps 2 through 5 implementation.
4. Step 6 verification.

Report after Step 0, then again after Step 6 with the verification results.

---

## Note on the Grammarly toast

A "1 error" toast has appeared on several platform-portal screens. Some of it is likely a React hydration warning caused by the Grammarly browser extension injecting `data-gr-*` attributes before React hydrates, not an application fault. While verifying this page, open it once in an incognito window with extensions disabled. If the toast disappears with extensions off, it is extension noise, not a bug in this page, and no code change is needed for it. If the toast persists with extensions off, report it separately, because then there is a genuine error to chase.
