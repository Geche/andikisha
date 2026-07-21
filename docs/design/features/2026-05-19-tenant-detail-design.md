# Tenant Detail Page — Design

**Date:** 2026-05-19  
**Audit reference:** `docs/audits/2026-05-19-tenant-detail-audit.md`  
**Implementation note:** extendTrial fix (TENANT-BACKLOG-003) is included in the V1 implementation phase per Adjustment 1. Same cancel-fix pattern: single transaction updates both `Tenant.trialEndsAt` and `TenantLicence.endDate` atomically.

---

## A. User Context

The SUPER_ADMIN lands on this page from four distinct scenarios. The page design must serve all four without requiring the SUPER_ADMIN to navigate away.

**Scenario 1 — Investigating a complaint.** A tenant admin calls support because something is broken. The SUPER_ADMIN needs to confirm identity (is this the right tenant?), check current status (are they even active?), and read the licence (are they on a plan that includes this feature?). Speed to identity and status is the priority.

**Scenario 2 — Processing a cancellation request.** The tenant has asked to stop their subscription. The SUPER_ADMIN needs to confirm the org name before taking the irreversible cancel action. Friction here is correct — the SUPER_ADMIN should have to make a deliberate choice.

**Scenario 3 — Supporting onboarding.** A new tenant's admin is locked out (forgot the temp password). The SUPER_ADMIN resets the password and reads it to them over the phone. The reset action and the resulting temp password need to be fast and obvious.

**Scenario 4 — Responding to non-payment.** Finance flags a tenant for suspension. The SUPER_ADMIN needs to confirm who they're about to suspend (not hit the wrong tenant), enter a reason, and do it. They may also need to reactivate later.

---

## B. Information Hierarchy

Within a single page load, ranked by how often the SUPER_ADMIN needs it immediately:

1. **Identity + status.** Who is this tenant? What state are they in right now? (Already partially in the stub.)
2. **Current licence.** What plan, how many seats, what price, when does it expire? Determines what the tenant can and can't do.
3. **Available actions.** What can the SUPER_ADMIN do from here — and which actions are valid given the current status?
4. **Licence history.** What happened before? Useful for context but not the first thing needed.
5. **Feature flags.** Operational toggle — relevant but situational.
6. **Statutory info.** Compliance fields — rarely needed, read-only, never urgent.

This ranking drives the top-to-bottom layout order.

---

## C. Section Inventory

Six sections. No more.

### Section 1 — Identity Strip (top of page, always visible)

**Shows:** Organisation name, status badge, admin email, admin phone, tenant ID (small), created date.  
**Source:** `GET /api/v1/super-admin/tenants/{tenantId}` → `TenantDetailResponse`  
**Suspension reason banner:** When status = SUSPENDED, a red/amber inset below the strip shows `suspensionReason`. Not a separate section — part of identity.  
**Trial expiry notice:** When status = TRIAL, shows `trialEndsAt` inline with days remaining.  
**Risk if removed:** SUPER_ADMIN has no identity confirmation before taking action.

### Section 2 — Current Licence Card

**Shows:** Plan name, seat count, agreed price (KES), billing cycle (MONTHLY/ANNUAL), start date, end date, licence status badge.  
**Source:** `currentLicence` field from the same `GET /tenants/{tenantId}` call — no second request.  
**Empty state:** If `currentLicence` is null (provisioning edge case), show InlineAlert: "No licence found for this tenant."  
**Risk if removed:** SUPER_ADMIN has no visibility into what the tenant is paying for or when their licence expires.

### Section 3 — Lifecycle Actions

**Shows:** Context-sensitive action buttons based on current status. Not all buttons are always visible.

| Action | Visible when | Button variant |
|---|---|---|
| Suspend | status = ACTIVE or TRIAL | `danger` |
| Reactivate | status = SUSPENDED | `primary` |
| Extend trial | status = TRIAL | `secondary` |
| Reset admin password | always | `secondary` |
| Cancel tenant | status ≠ CANCELLED | `danger`, clearly separated |

Actions that are irrelevant for the current status are hidden entirely (not disabled). A CANCELLED tenant shows only "Reset admin password" (for archival/audit access). A SUSPENDED tenant shows Reactivate and Cancel but not Suspend.

**Source / interaction:** Each button opens a modal. Modals call their respective endpoints. On success, the React Query cache for `["tenant", tenantId]` is invalidated — the page refetches and reflects the new status automatically.  
**Risk if removed:** SUPER_ADMIN must use curl or the API directly to manage tenant lifecycle — not viable for non-technical operators.

### Section 4 — Licence History Timeline

**Shows:** Ordered list of status transitions — each row shows: transition date, previous status → new status, changed by (user ID / "SYSTEM"), reason.  
**Source:** `GET /api/v1/super-admin/tenants/{tenantId}/licences/history` — separate fetch, loaded below the fold.  
**Empty state:** "No licence history yet." (Brand new tenant with no transitions.)  
**Visual:** Timeline-style list, newest first. Status values displayed as `Badge` components. The `changedBy` field is a raw user ID string — display as-is (no lookup to a name; that requires auth-service call out of scope for V1).  
**Risk if removed:** SUPER_ADMIN has no audit trail for the tenant's lifecycle — violates KDPA accountability requirement.

### Section 5 — Feature Flags

**Shows:** Registry-known flags as toggle rows. Tenant-specific flags not in the registry listed below as "Custom flags". "Add custom flag" input at the bottom.  
**Source:** `GET /api/v1/super-admin/tenants/{tenantId}/feature-flags`  
**Empty state (new tenant, no flags in DB):** "No feature flags have been set for this tenant. Registry flags are shown below — enable any that apply."  
**Source of truth for known flags:** `featureFlagsRegistry.ts` — starts empty, populated as backend features are flagged.  
**Risk if removed:** No way to enable/disable per-tenant features without API access.

### Section 6 — Statutory Information

**Shows:** KRA PIN, NSSF number, SHIF number, pay frequency, pay day. All read-only — no edit capability (no backend update endpoint).  
**Source:** `TenantDetailResponse` fields.  
**If null:** Show "—" for each missing field.  
**Risk if removed:** Compliance team has no fast path to check statutory registration numbers when responding to regulatory queries.

---

## D. Layout

**Single scrollable page.** No tabs.

Tabs would require the SUPER_ADMIN to know which tab holds which information. For a page with 6 sections and a clear top-to-bottom hierarchy (identity → licence → actions → history → flags → statutory), tabs add cognitive overhead without benefit.

Layout structure:

```
PageHeader (org name | back button)
──────────────────────────────────────────────────────────
[Section 1: Identity Strip]           ← full width
[Suspension reason banner if SUSPENDED]
[Section 3: Lifecycle Actions]        ← full width, action buttons in a row
──────────────────────────────────────────────────────────
[Section 2: Current Licence Card]     ← lg:col-span-5
[Section 6: Statutory Info]           ← lg:col-span-3

[Section 4: Licence History]          ← full width
[Section 5: Feature Flags]            ← full width
```

At `max-w-5xl` (80rem). The page does not cap at `max-w-2xl` like the create form — this is a data-heavy page that benefits from the full content width.

Why actions above licence? The SUPER_ADMIN coming from Scenario 3 (locked-out admin) needs to hit "Reset admin password" immediately, not scroll past the licence card first. Actions visible early saves keystrokes for the most time-sensitive scenario.

---

## E. Visual Language

All existing platform-portal tokens. No new tokens needed.

| Element | Token |
|---|---|
| Page background | `bg-neutral-50` (shell default) |
| Cards | `bg-surface border border-neutral-200 rounded-xl` |
| Status badge colours | existing `BadgeStatus` mapping |
| Suspension reason banner | `bg-red-50 border border-error` text `text-error` |
| Trial expiry notice | `bg-amber-light border border-amber` text `text-amber-text` |
| Danger action buttons | `Button variant="danger"` |
| Destructive confirm modals | amber warning icon + `border-error` confirm input |
| Cancel confirm input | `border-error` styled `Input` matching typed name |
| Timeline entries | `border-l-2 border-neutral-200` left border with dot |
| Feature flag toggles | Lucide `Toggle...` not available — use custom checkbox-style inline button (see G.11) |
| "Soon" / disabled states | `opacity-40 cursor-not-allowed` |

Typography follows existing conventions: `text-[13px]` body, `text-[11px]` labels, `text-[15px] font-bold` section headings.

---

## F. Interaction Patterns

### F.1 Destructive Action Friction (Adjustment 3)

Friction is proportional to irreversibility:

**Feature flag toggle — inline confirmation only**
Click the toggle → a small confirm popover appears inline: `"Enable [flag key] for [org name]? [Confirm] [Cancel]"`. No full modal. 2-second undo window would be better but is out of scope for V1. Confirmation is the minimum.

**Reactivate — simple modal, no typed input required**
Modal title: "Reactivate [org name]?" Body: "The tenant's licence will return to ACTIVE. They will regain access immediately." Buttons: `[Cancel]` `[Reactivate]`. One click to confirm.

**Extend trial — input + modal**
Modal title: "Extend trial for [org name]". Body contains a number input: "Additional days (1–90)". Hint: "Current trial end: [date]. New end: [calculated date]." Buttons: `[Cancel]` `[Extend Trial]`. The calculated new date updates live as the SUPER_ADMIN types.

**Reset admin password — modal with consequence explanation**
Modal title: "Reset admin password". Body: "This will generate a new temporary password for [admin email]. Their current session will be terminated and they must change the password on next login. You will need to share the new password securely." Buttons: `[Cancel]` `[Reset Password]`. On success, a result modal shows the new temp password with copy button — identical UX to the tenant creation success modal.

**Suspend — modal with mandatory reason field**
Modal title: "Suspend [org name]". Body: reason `<textarea>` (`@NotBlank`, max 500 chars). Hint: "Reason is stored on the account and visible in history." Buttons: `[Cancel]` `[Suspend Tenant]`. Submit is disabled until reason has content.

**Cancel — typed verification (highest friction)**
Modal title: "Cancel tenant account". Warning: `InlineAlert variant="error"` — "This action permanently cancels the tenant's account. It cannot be undone." Body: `"Type the organisation name to confirm:"` followed by a text input. Submit button is disabled until the typed value exactly matches `organisationName` (case-sensitive). Button text: "Permanently Cancel Account". Button variant: `danger`.

### F.2 Loading States

Each action button shows a `Spinner` and disables while its request is in-flight. The parent page shows a full `Spinner` only on initial load. On refetch-after-action, the existing data remains visible (no loading flash) while React Query fetches the updated state in the background.

### F.3 Error States

Action failure → modal stays open, `InlineAlert variant="error"` appears inside the modal with the error message. SUPER_ADMIN can retry or cancel. The page data is NOT invalidated on failure (no spurious refetch).

HTTP 409 on suspend (already suspended) → error: "This tenant is already suspended."  
HTTP 400 on extend-trial (out of range) → error: "Additional days must be between 1 and 90."  
HTTP 404 on any action → error: "Tenant not found. The page may be stale — refresh."  
Auth-service gRPC failure on password reset → error: "Password reset failed. The auth service may be unavailable."

### F.4 Page-Level Refetch After Action

On successful action: `queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] })`. This triggers a silent refetch. The identity strip and licence card update to reflect the new status without navigation.

---

## G. Design Decisions

**G.1 — Actions section above licence card.**  
Rationale: the locked-out-admin scenario (Scenario 3) requires reaching "Reset admin password" without scrolling. Licence information is needed for context but rarely the immediate first need.

**G.2 — Status-conditional action visibility (hide, not disable).**  
Disabling a "Suspend" button when the tenant is already suspended invites the question "why is this here?" Hiding it removes the confusion entirely. The SUPER_ADMIN sees only actions that can succeed.

**G.3 — Suspension reason shown inline in the identity strip, not as a separate section.**  
A seventh section for a single text field would inflate the page. The reason banner sits directly below the identity strip as a coloured inset — it's contextually attached to the identity, not floating.

**G.4 — Licence history newest-first.**  
SUPER_ADMIN wants to know what happened recently, not the full backstory. Newest-first matches mental model. Full history is scrollable below.

**G.5 — `changedBy` display: truncated UUID for SUPER_ADMIN actions, "System" for automated jobs.**  
Automated jobs (`LicenceExpiryJob`) use the sentinel value `"SYSTEM"` as the `changedBy` actor — verified in source. The UI applies:
```typescript
function formatChangedBy(changedBy: string | null) {
  if (!changedBy || changedBy === "SYSTEM") return "System";
  return changedBy.slice(0, 8) + "…"; // first 8 chars; full UUID on hover title
}
```
A future improvement can add a name lookup once auth-service exposes a `GetUserById` gRPC method.

**G.6 — Feature flags section shows registry + existing + add-custom input.**  
Registry entries give named toggles for known flags (even before the flag is in the tenant's DB row — toggling creates it). Unknown-but-existing flags surface transparently. The add-custom input supports operational flexibility without requiring code deploys for new flag keys.

**G.7 — Statutory information in the 3-column right sidebar alongside the licence card.**  
It's read-only, low urgency, and compact. Pairing it with the licence card in a 5+3 grid uses vertical space efficiently and keeps it above the fold on most monitors.

**G.8 — extendTrial fix included in implementation (not deferred).**  
The detail page's "Extend Trial" action would immediately surface the `TenantLicence.endDate` discrepancy — the history timeline would show the new trial-end date from Tenant.trialEndsAt while the licence card shows the old TenantLicence.endDate. Fixing this in the same implementation step (TENANT-BACKLOG-003) costs ~15 min and prevents visible inconsistency.

**G.9 — Cancel typed verification is case-sensitive and matches `organisationName` exactly.**  
Rationale: the SUPER_ADMIN typed the org name at provisioning and sees it in the page header. Requiring an exact match forces them to read the name on screen rather than type from memory. This catches the "wrong tenant" scenario.

**G.10 — Password reset result modal is reused from tenant creation.**  
Same UX: large monospace font, copy button, amber warning. Familiarity reduces the cognitive load of an infrequent but high-stakes action. Not a new pattern to learn.

**G.11 — Feature flag toggles use a styled button, not a native checkbox.**  
Native checkbox has inconsistent styling cross-browser and doesn't support the inline confirmation popover cleanly. A styled `<button>` with a Lucide `ToggleLeft` / `ToggleRight` icon provides clear affordance and allows attaching the confirm popover without fighting the checkbox event model.

**G.12 — Page width is `max-w-5xl`, not `max-w-2xl`.**  
The create form is narrow because it's a focused input task. The detail page is a reference page — more like a dashboard than a form. It benefits from the full readable width.

**G.13 — No pagination on licence history for V1.**  
History entries will be single-digit counts for the foreseeable future (tenants change lifecycle status rarely). Infinite scroll or pagination would be premature. If a tenant somehow has 50+ history entries, the page gets long — acceptable for V1.

**G.14 — "Add custom flag" input uses a small inline form at the bottom of the feature flags section, not a separate modal.**  
A modal for a single text input is disproportionate. Inline form: text input + [Enable] button. On submit, calls `PUT .../feature-flags/{key}/enable`. If the key already exists, the existing toggle row updates.

**G.15 — Licence history `changedBy` shows truncated user ID (first 8 chars + "…").**  
Full UUID (36 chars) is unreadable in the table. `2a3f8b1c…` is enough for identification. Full value is available on hover via `title` attribute.

**G.16 — Cancelled tenant page does not hide the cancelled status with a "go back" redirect.**  
The SUPER_ADMIN arriving at a cancelled tenant's detail page should see the cancellation state clearly (when it was cancelled, the history). Redirecting away would make the page unusable for post-cancellation audit. Show everything in read-only mode.

---

## H. Resolved Questions and Known Limitations

**H.1 — CANCELLED is terminal. No reactivation path. [RESOLVED]**  
The state machine's `CANCELLED → (none)` is intentional. Cancellation terminates the billing relationship and triggers notifications; un-cancelling would invalidate that contract. Real scenarios requiring re-engagement are handled by re-provisioning as a new tenant. The design (read-only mode for CANCELLED, reset-password always available) is correct.

**H.2 — Feature flags: ship as-is with explanatory note (option a). [RESOLVED]**  
Section ships with empty state text:
> "No feature flags currently registered for the platform. As features ship with flag-gated rollouts, they will appear here. To toggle a specific flag for this tenant before it's added to the registry, use 'Add custom flag' below."

**H.3 — `changedBy` — SYSTEM sentinel confirmed, UI handles it. [RESOLVED]**  
Automated jobs (`LicenceExpiryJob`) use `SYSTEM_ACTOR = "SYSTEM"`. The `formatChangedBy()` helper in G.5 renders this as "System" and truncates UUID actors to 8 chars with full value on hover. No action needed beyond implementation.

**H.4 — Password reset notification gap. [KNOWN LIMITATION]**  
V1 ships without automated email notification of admin password reset events. SUPER_ADMIN shares the temp password verbally. Tracked in NOTIFICATION-BACKLOG-001 (scope explicitly includes `AdminPasswordResetEvent`). No implementation action needed now.

**H.5 — Renew and upgrade deferred to future `/tenants/{id}/licence` page. [RESOLVED]**  
A "Manage licence →" link appears top-right of the licence card, muted with "Coming soon" tooltip (same treatment as unbuilt nav dropdown items). Confirms the path exists without implementing it now.

---

## Refinements (resolved post-review)

**Refinement 1 — Reset admin password always available, including CANCELLED tenants.**  
Post-cancellation access is needed for data export and compliance closeout. The always-visible reset button in the design is correct.

**Refinement 2 — Action button grouping with visual separation.**  
Left: Routine actions (Extend trial, Reset admin password). Middle: Status-change actions (Suspend / Reactivate). Right (separated by margin): Cancel tenant. Prevents accidental click into the destructive zone.

**Refinement 3 — History empty state copy.**  
"No licence transitions yet. History entries appear here when a licence is suspended, reactivated, extended, or cancelled."

**Refinement 4 — Success toasts for lifecycle actions.**  
- Suspend → `"Suspended {orgName}"`
- Reactivate → `"Reactivated {orgName}"`
- Extend trial → `"Trial extended to {newDate}"`
- Reset password → no toast (the result modal is the confirmation)
- Cancel → `"Cancelled {orgName}"`
