# Tenant Detail Page — Audit

**Date:** 2026-05-19  
**Scope:** Read-only. Documents what backend exists to support a full tenant detail page in platform-portal.  
**Design doc:** `docs/design/2026-05-19-tenant-detail-design.md` (to be written after this)

---

## 1. Existing Backend Endpoints

All endpoints are in `SuperAdminController.java` at `/api/v1/super-admin`, all gated by `@PreAuthorize("hasRole('SUPER_ADMIN')")`.

| Endpoint | Method | Status | Returns |
|---|---|---|---|
| `/tenants/{tenantId}` | `GET` | ✅ Exists | `TenantDetailResponse` |
| `/tenants/{tenantId}/suspend` | `PATCH` | ✅ Exists | 204 No Content |
| `/tenants/{tenantId}/reactivate` | `PATCH` | ✅ Exists | 204 No Content |
| `/tenants/{tenantId}/extend-trial` | `PATCH` | ✅ Exists | `TenantSummaryResponse` |
| `/tenants/{tenantId}` | `DELETE` | ✅ Exists | 204 No Content — soft cancel |
| `/tenants/{tenantId}/licences/history` | `GET` | ✅ Exists | `List<LicenceHistoryResponse>` |
| `/tenants/{tenantId}/licences/renew` | `POST` | ✅ Exists | `LicenceResponse` |
| `/tenants/{tenantId}/licences/upgrade` | `POST` | ✅ Exists | `LicenceResponse` |
| `/tenants/{tenantId}/feature-flags` | `GET` | ✅ Exists | `List<FeatureFlagResponse>` |
| `/tenants/{tenantId}/feature-flags/{featureKey}/enable` | `PUT` | ✅ Exists | `FeatureFlagResponse` |
| `/tenants/{tenantId}/feature-flags/{featureKey}/disable` | `PUT` | ✅ Exists | `FeatureFlagResponse` |
| `/tenants/{tenantId}` | `PUT` | ❌ Does not exist | — |
| `/tenants/{tenantId}/admin-password-reset` | Any | ❌ Does not exist | — |

### 1.1 `GET /api/v1/super-admin/tenants/{tenantId}` — Full detail

Returns `TenantDetailResponse`:

| Field | Type | Notes |
|---|---|---|
| `tenantId` | `UUID` | |
| `organisationName` | `String` | |
| `status` | `String` | `TenantStatus.name()` — ACTIVE / TRIAL / SUSPENDED / CANCELLED / DELETED |
| `createdAt` | `LocalDateTime` | |
| `adminEmail` | `String` | |
| `adminPhone` | `String` | |
| `kraPin` | `String` | nullable — statutory registration |
| `nssfNumber` | `String` | nullable |
| `shifNumber` | `String` | nullable |
| `payFrequency` | `String` | nullable — pay cycle configuration |
| `payDay` | `Integer` | nullable |
| `suspensionReason` | `String` | nullable — only set when status = SUSPENDED |
| `trialEndsAt` | `LocalDate` | nullable — only set when status = TRIAL |
| `currentLicence` | `LicenceResponse` | nullable — null if no licence exists |

`LicenceResponse` sub-object:

| Field | Type |
|---|---|
| `licenceId` | `UUID` |
| `tenantId` | `String` |
| `planId` | `UUID` |
| `planName` | `String` |
| `licenceKey` | `UUID` |
| `billingCycle` | `BillingCycle` — MONTHLY / ANNUAL |
| `seatCount` | `int` |
| `agreedPriceKes` | `BigDecimal` |
| `currency` | `String` |
| `startDate` | `LocalDate` |
| `endDate` | `LocalDate` |
| `status` | `LicenceStatus` — see §2 |
| `suspendedAt` | `LocalDateTime` — nullable |
| `createdBy` | `String` |

### 1.2 `PATCH /api/v1/super-admin/tenants/{tenantId}/suspend`

Requires request body `SuspendTenantRequest` containing `reason: String` (`@NotBlank`). Delegates to `LicenceStateMachineService.suspend()`. Records `LicenceHistory` entry. Publishes `TenantSuspendedEvent` after commit. Returns 204.

### 1.3 `PATCH /api/v1/super-admin/tenants/{tenantId}/reactivate`

No request body. Delegates to `LicenceStateMachineService.reactivate()`. Records `LicenceHistory` entry. Publishes `TenantReactivatedEvent` after commit. Returns 204.

### 1.4 `PATCH /api/v1/super-admin/tenants/{tenantId}/extend-trial`

Requires request body `ExtendTrialRequest` containing `additionalDays: int` (`@Min(1)`). Delegates to `SuperAdminTenantService.extendTrial()`. Returns `TenantSummaryResponse`.

### 1.5 `DELETE /api/v1/super-admin/tenants/{tenantId}` — Cancel

Calls `SuperAdminTenantService.cancelTenant()`. Sets tenant status to CANCELLED. Publishes `TenantCancelledEvent` after commit. Returns 204. This is a soft delete — the row remains in the database.

**Gap:** The LicenceStateMachineService enforces valid transitions but `cancelTenant()` calls `tenant.cancel()` directly on the entity without going through the state machine. It then publishes a TenantCancelledEvent but the TenantLicence record may not be updated by this path. Investigate before implementing the cancel UI action.

### 1.6 `GET /api/v1/super-admin/tenants/{tenantId}/licences/history`

Returns `List<LicenceHistoryResponse>` ordered by changedAt descending:

| Field | Type |
|---|---|
| `id` | `UUID` |
| `tenantId` | `String` |
| `licenceId` | `UUID` |
| `previousStatus` | `LicenceStatus` |
| `newStatus` | `LicenceStatus` |
| `changedBy` | `String` — sub claim from JWT |
| `changeReason` | `String` — nullable |
| `changedAt` | `LocalDateTime` |

### 1.7 Feature flags

The `FeatureFlag` entity is a per-tenant key/value boolean (`featureKey: String`, `enabled: boolean`). Auto-created on first access (enable/disable creates the row if it doesn't exist). The SUPER_ADMIN endpoints operate on an explicit `tenantId` param. Flags are string-keyed — there is no global registry of "what flags exist". A SUPER_ADMIN enabling `feature-x` for a tenant that doesn't have `feature-x` in its flag table creates a new row silently. This is intentional by design.

### 1.8 Missing endpoints

**No tenant update endpoint (`PUT /tenants/{tenantId}`).**  
There is no way to rename the organisation, update the admin's email/phone, or change statutory registration numbers (KRA PIN, NSSF, SHIF) via the SUPER_ADMIN API. These fields exist on the `Tenant` entity but no update path is exposed. Updating contact details and statutory data would require a new endpoint.

**No admin password reset endpoint.**  
No `POST /tenants/{tenantId}/admin-password-reset` or equivalent exists anywhere in the codebase (grep confirmed zero results). The only way to reset a tenant admin's credentials is through the standard password reset flow (forgot-password → email → reset link), which operates on the auth-service directly. The SUPER_ADMIN cannot trigger a reset from the UI without a new endpoint.

---

## 2. Tenant Status State Machine

There are **two parallel state machines**:

### 2.1 TenantStatus (on the Tenant aggregate)

```
TRIAL → ACTIVE → SUSPENDED → CANCELLED
         ↓                    ↑
         CANCELLED ──────────┘
DELETED (no transitions defined — dead status)
```

Methods on Tenant entity: `activate()`, `suspend(reason)`, `cancel()`, `reactivate()`. The Tenant entity does NOT enforce which transitions are valid — it simply sets the field.

### 2.2 LicenceStatus (on TenantLicence — enforced by LicenceStateMachineService)

```
TRIAL ──────────────────────────────► CANCELLED
  │
  ▼
ACTIVE ──────────────────────────────► CANCELLED
  │
  ▼
GRACE_PERIOD ────────────────────────► CANCELLED
  │
  ▼
SUSPENDED ───────────────────────────► CANCELLED
  │                                      ▲
  ▼                                      │
EXPIRED ───────────────────────────────┘
```

Full allowed transitions (`LicenceStateMachineService.ALLOWED_TRANSITIONS`):

| From | To |
|---|---|
| TRIAL | ACTIVE, CANCELLED |
| ACTIVE | GRACE_PERIOD, SUSPENDED, CANCELLED |
| GRACE_PERIOD | ACTIVE, SUSPENDED, CANCELLED |
| SUSPENDED | ACTIVE, EXPIRED, CANCELLED |
| EXPIRED | CANCELLED |
| CANCELLED | (none) |

**Enforcement:** `LicenceStateMachineService` validates transitions before persisting and throws `BusinessRuleException("INVALID_TRANSITION", ...)` on invalid attempts. Every transition records a `LicenceHistory` row.

**GRACE_PERIOD and EXPIRED** are LicenceStatus states that do not map 1:1 to TenantStatus values. A tenant with a GRACE_PERIOD licence still has TenantStatus = ACTIVE. These states exist for payment retry windows but there is no UI-triggered API to enter GRACE_PERIOD — it would be triggered by a payment failure job (not yet built).

**Discrepancy:** `SuperAdminTenantService.cancelTenant()` calls `tenant.cancel()` directly (sets TenantStatus = CANCELLED) but does not go through `LicenceStateMachineService`. The TenantLicence row may stay in its current state (ACTIVE/TRIAL) while the Tenant row says CANCELLED. The SUPER_ADMIN `DELETE /tenants/{tenantId}` endpoint uses this path. This is a **data consistency gap** — if the cancel UI is built, it should call `LicenceStateMachineService` to also transition the licence to CANCELLED.

---

## 3. Audit Trail

### 3.1 LicenceHistory (exists, complete)

`LicenceHistory` is an append-only audit entity in tenant-service. Every call through `LicenceStateMachineService` writes one row before transitioning the licence status. Fields: `previousStatus`, `newStatus`, `changedBy`, `changeReason`, `changedAt`. This is the primary historical record for licence lifecycle.

Retrievable via `GET /api/v1/super-admin/tenants/{tenantId}/licences/history`.

### 3.2 Audit-service (partial)

`TenantAuditListener` in audit-service listens on `audit.tenant-events` queue and handles:
- `TenantCreatedEvent` → records CREATE action
- `TenantSuspendedEvent` → records UPDATE action

Does NOT yet handle: `TenantCancelledEvent`, `TenantReactivatedEvent`, `LicenceRenewedEvent`, `LicenceUpgradedEvent`. These events are published to RabbitMQ but the audit-service ignores them.

### 3.3 No TenantHistory entity

There is no `TenantHistory` entity tracking changes to the Tenant aggregate itself (organisation name edits, contact changes, KRA PIN updates). The `Tenant` entity has `updatedAt` from `BaseEntity` but no field-level changelog. If a tenant update endpoint is ever added, a history mechanism would need to be added separately.

---

## 4. Notification Triggers on Lifecycle Events

`notification-service` `TenantEventListener` handles exactly one event:
- `TenantCreatedEvent` → welcome email to admin

The following events are **published to RabbitMQ but produce no notification email**:
- `TenantSuspendedEvent` — no email sent
- `TenantReactivatedEvent` — no email sent
- `TenantCancelledEvent` — no email sent
- `LicenceRenewedEvent` — no email sent
- `LicenceUpgradedEvent` — no email sent

For a professional SaaS product, suspension and cancellation at minimum should trigger notification emails to the tenant admin. This is a **notification gap** — filing it as a backlog item rather than blocking the detail page UI.

---

## 5. Feature Flag Infrastructure

- **Storage:** Custom database-backed, one row per `(tenantId, featureKey)` in the `feature_flags` table.
- **Schema:** `featureKey` string (max 100 chars), `enabled` boolean, `description` (max 500 chars).
- **No global registry:** There is no table of "known platform feature keys." Any string is a valid key. The SUPER_ADMIN UI would need to either hard-code known flag names or let the operator type them freely.
- **Auto-create:** Enabling or disabling a flag that doesn't exist yet creates the row. This means the feature flags list for a new tenant will be empty until at least one flag has been toggled.
- **No platform-level flags:** Feature flags are always scoped to a specific tenant. There is no concept of "enable X for all tenants."

---

## 6. Summary of Gaps

| Gap | Severity | Implication for detail page |
|---|---|---|
| No tenant update endpoint | Medium | Cannot edit org name or contact details from UI — omit edit fields, show read-only |
| No admin password reset endpoint | Medium | Cannot trigger password reset from detail page — redirect to auth reset flow or note as out-of-scope |
| `cancelTenant()` bypasses LicenceStateMachineService | High | Cancel action in UI should not call `DELETE /tenants/{id}` until this is fixed; the licence row stays in wrong state |
| Notification-service handles no lifecycle events beyond TenantCreated | Low | No emails on suspend/reactivate/cancel — document in the UI rather than blocking |
| Audit-service misses Cancel/Reactivate/Upgrade events | Low | Audit log will be incomplete — acceptable for now |
| Feature flag list is empty for new tenants | Low | Show empty state with explanation rather than hiding the section |
| No history for Tenant aggregate changes | Low | Only licence history is available — scope history section accordingly |

---

## 7. Recommended Scope for V1 Detail Page

Based on what exists today:

**Build now (all backend exists):**
- Tenant identity section — org name, admin email/phone, status badge, creation date
- Current licence section — plan, seats, price, billing cycle, start/end dates
- Licence status history — timeline from `GET .../licences/history`
- Trial extension action — via `PATCH .../extend-trial`
- Suspend action — via `PATCH .../suspend` with reason input
- Reactivate action — via `PATCH .../reactivate`
- Feature flags section — list + toggle per flag (knowing the list will be empty for new tenants)

**Defer (missing backend or data integrity risk):**
- Cancel/terminate tenant — backend gap (bypasses state machine); defer until fixed
- Admin password reset — endpoint does not exist
- Org rename / contact edit — no update endpoint
- Renew / upgrade licence — complex workflows deserving their own focused page

**Show as read-only (data exists, no mutation):**
- Statutory fields (KRA PIN, NSSF, SHIF) — display only, no edit
- Suspension reason — display when status = SUSPENDED
