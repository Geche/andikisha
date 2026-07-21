# Cancelled Tenant Page — Design

**Date:** 2026-05-20
**Scope:** The platform-portal tenant detail page when the tenant status is CANCELLED. Covers the diagnostic that must run first, the page layout, the single permitted action, and the error-message split. Implementation follows Lawrence review.

---

## 1. The problem

A cancelled tenant currently shows "Tenant not found or failed to load. It may have been deleted." with a red error toast. That is wrong. The tenant exists. It was cancelled, and its record is retained for compliance. The page treats a settled, retained record as a load failure.

This was raised several rounds ago as Issue 1 and deprioritised behind the auth rework. It is now the last open functional bug on the tenant detail surface.

---

## 2. Diagnostic first (this forks the fix)

Before any frontend change, confirm what the backend actually returns for a cancelled tenant. The fix path depends on the answer.

Call the detail endpoint with a SUPER_ADMIN token against a known cancelled tenant:

```
GET /api/v1/super-admin/tenants/{cancelledTenantId}
```

Two outcomes:

**Outcome A — the endpoint returns 404 or 403.** The service is filtering CANCELLED out of single-tenant fetches. The frontend cannot render what it cannot fetch, so it falls back to the not-found message. Fix is partly backend: the single-tenant fetch must return cancelled tenants. The list endpoint may keep filtering them out, but the detail fetch must not.

**Outcome B — the endpoint returns 200 with the tenant data.** The data is there and the frontend is treating `status === 'CANCELLED'` as an error. Fix is frontend only.

Report which outcome before writing the page. The design below is the same either way. Only the implementation path changes.

---

## 3. What this page is for

A cancelled tenant is not an operational account. Nobody runs payroll for it. The page is a retention record, a tombstone with a paper trail. The people who land here are doing one of a few things: confirming when and why the tenant was cancelled, checking what data is retained against the KRA seven-year obligation, resetting the admin password so a former customer can reach their historical payslips, or auditing the lifecycle during a dispute.

That reframes the design. The job is to make the cancellation legible and expose the historical record, without offering operational actions that no longer make sense.

---

## 4. Layout

The page reuses the active tenant detail shell so it stays familiar inside the platform-portal horizontal layout. It reads as a settled terminal state rather than a working account. Top to bottom:

### 4.1 Cancellation banner

First element on the page, above the identity strip. Muted treatment, not alarm red, because this is a settled fact and not an active error. Use a neutral or muted surface with a left border, not the red error styling.

One clear line stating the essentials:

> This tenant was cancelled on 18 May 2026 by superadmin@andikisha.com.

If a cancellation reason was captured at cancel time, show it below that line. Pull the date and actor from the latest licence history entry (the CANCELLED transition).

This banner is the single most important element. It answers "what am I looking at" immediately, which is exactly what the current error fails to do.

### 4.2 Identity strip

Same layout as the active tenant detail page: organisation name, admin email, admin phone, tenant ID, workspace, created date. One difference: the status badge reads CANCELLED in a muted neutral treatment, not the active brand-500 green or the trial amber. The workspace stays visible because it is part of the record (see decision in §6 on workspace reuse).

### 4.3 Licence history timeline

The centrepiece of this page. On an active tenant the current licence card matters most. On a cancelled tenant the history is the entire point, so it moves up in visual priority.

Show the full arc in chronological order: created, trial started, any plan changes, any suspensions and reactivations, and the final cancellation event with its timestamp and actor. This is the audit trail the visitor came to read.

### 4.4 Retention statement

An explicit statement of the retention obligation:

> Data retained until 18 May 2033 per KRA record-keeping requirements.

Compute the retention end date as the cancellation date plus seven years. This turns an invisible compliance obligation into a visible, defensible fact and explains why the tenant still exists in the system rather than being hard-deleted.

### 4.5 Retained data acknowledgement (display only for V1)

Acknowledge that historical employee and payslip records are retained. Do not build the browsing or retrieval UI on this page yet. A short statement is enough for V1:

> Employee and payroll records for this tenant are retained and available on request.

The full data-access interface is deferred (see §6).

---

## 5. Actions

This is where a cancelled tenant page differs most from an active one. Active tenants carry suspend, cancel, extend trial, change plan, and reset password. A cancelled tenant carries almost nothing, because the lifecycle is over. Do not render buttons that would fail or make no sense.

**Reset admin password — keep.** This is the single available action. The endpoint already works for cancelled tenants. A former customer may legitimately need access to retrieve historical payslips for a loan application or a tax matter. Label it for what it is, not as anything implying the account comes back to life. Suggested label: "Reset password for historical data access."

**Reactivate — do not show.** CANCELLED is terminal, locked earlier in the project. A returning customer is a new provisioning with a clean billing start, not a revived cancelled record. If reactivation becomes a real business need later, it gets its own design rather than a button bolted onto this page.

**Suspend, extend trial, change plan — do not show.** These would fail or make no sense on a closed account.

---

## 6. Decisions

**Retained data: show it exists, defer the access UI.** The retention statement and the acknowledgement are cheap and close the compliance-legibility gap now. The actual employee and payslip browsing interface is more work and serves a rarer need, so it lands as a follow-up once the frequency of real requests is known. Build the tombstone and the paper trail now. Build the retrieval drawer when a real request makes it necessary.

**Workspace: held, not reused, for V1.** A cancelled tenant keeps its workspace. Reusing it risks a new tenant inheriting bookmarks, cached links, or welcome-email URLs that pointed at the old one, which is a confusing and potentially data-sensitive collision in an HR system. Display the workspace on the page as part of the record without any "released" treatment. Reclaiming workspaces from long-cancelled tenants past the retention window is a deliberate cleanup feature, not a V1 concern.

**Reactivation is out of scope.** Confirmed terminal. Out of scope for this page.

---

## 7. Error-message split (beyond the page itself)

The current message conflates three different situations into one string: "Tenant not found or failed to load. It may have been deleted." Untangle them, because collapsing them is why a cancelled tenant looks like a failure.

| Situation | Detection | Behaviour |
|---|---|---|
| Cancelled tenant | Fetch returns 200 with `status === 'CANCELLED'` (or 403 with a cancelled marker, depending on §2 outcome) | Render the cancelled tenant page in §4. No error. |
| Genuine 404 | Fetch returns 404, the ID was never a tenant | "No tenant with this ID exists." with a link back to All Tenants. |
| Transient failure | Fetch returns 5xx or network error | "Couldn't load this tenant. Try again." with a retry control. |

A cancelled tenant should never reach an error state. The other two keep an error treatment, but each says what actually happened.

---

## 8. Brand and UI fidelity

Stay faithful to the existing platform-portal design. Do not introduce new patterns, new spacing scales, or new colours.

Reuse the existing tenant detail components and layout structure. The cancelled page is a state of that page, not a new page built from scratch. Where a section is read-only, render it with the same card and typography the active page already uses, minus the interactive controls.

Honour the locked brand tokens already in the codebase:

- Brand forest green for the identity and structural accents, the same as the active page.
- Amber is the only colour on interactive buttons. The reset-password button uses the existing button component, not a new style.
- brand-500 green is reserved for success and confirmation states. Do not use it for the CANCELLED badge. The CANCELLED badge is a muted neutral treatment.
- near-black for text, surface-alt warm off-white for any alternating section, neutral-* for muted text and borders.
- Token discipline: no raw hex, no gray-* classes. Use the existing semantic tokens and neutral-* scale already in use across the portal.
- Roboto, the canonical font, inherited from the existing layout.

The cancellation banner uses a muted neutral surface with a left border, not the red error component. Red stays reserved for genuine errors (the 404 and transient cases in §7).

---

## 9. Verification

1. Confirm the §2 diagnostic outcome and record it.
2. Load a cancelled tenant. The cancellation banner shows the correct date and actor pulled from licence history. No red error toast.
3. The status badge reads CANCELLED in muted neutral, not green or amber.
4. The licence history timeline shows the full arc ending in the cancellation event.
5. The retention statement shows the cancellation date plus seven years.
6. The only action present is reset admin password. No reactivate, suspend, extend, or change plan.
7. Reset admin password works against the cancelled tenant and surfaces the temp password as it does for active tenants.
8. Load a random non-existent UUID. The page shows "No tenant with this ID exists," not the cancelled layout.
9. Simulate a 5xx or network failure. The page shows "Couldn't load this tenant. Try again." with a retry, not the cancelled layout and not the not-found message.
10. Confirm the page reuses existing components and tokens. No new colours, no raw hex, no gray-* classes.
