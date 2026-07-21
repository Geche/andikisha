# Flow 1: Tenant Creation UI — Audit

**Date:** 2026-05-19  
**Scope:** Backend contract, gateway routing, and UI primitives readiness for `/tenants` and `/tenants/new` in platform-portal.  
**Status:** Read-only. No code written. Findings inform the design doc.

---

## 1. Backend Endpoints

### 1.1 `POST /api/v1/super-admin/tenants` — Create Tenant

**Controller:** `SuperAdminController.java:81-87`  
**Service:** `SuperAdminTenantService.createTenantWithLicence`  
**HTTP status on success:** 201 Created

#### Request: `CreateTenantWithLicenceRequest`

| Field | Type | Constraints |
|---|---|---|
| `organisationName` | `String` | `@NotBlank`, `@Size(max=200)` |
| `adminEmail` | `String` | `@NotBlank`, `@Email` |
| `adminFirstName` | `String` | `@NotBlank`, `@Size(max=100)` |
| `adminLastName` | `String` | `@NotBlank`, `@Size(max=100)` |
| `adminPhone` | `String` | `@NotBlank`, regex `^(\+254|0)7\d{8}$` |
| `planId` | `UUID` | `@NotNull` |
| `billingCycle` | `BillingCycle` | `@NotNull`, enum: `MONTHLY | ANNUAL` |
| `seatCount` | `int` | `@Min(1)` |
| `agreedPriceKes` | `BigDecimal` | `@NotNull`, `@DecimalMin("0.0")` |
| `trialDays` | `int` | `@Min(0)` (0 = no trial, starts active) |

Phone validation accepts `+2547XXXXXXXX` and `07XXXXXXXX`. The form must handle both formats; the backend normalises the email to lowercase but not the phone.

#### Response: `ProvisionedTenantResponse`

| Field | Type | Notes |
|---|---|---|
| `tenantId` | `UUID` | Primary identifier for subsequent calls |
| `organisationName` | `String` | |
| `licenceKey` | `UUID` | Licence row UUID |
| `licenceStatus` | `LicenceStatus` | `TRIAL` if `trialDays > 0`, otherwise `ACTIVE` |
| `planName` | `String` | Human-readable plan name |
| `adminEmail` | `String` | Lowercased version of input |
| `temporaryPassword` | `String` | One-time password — shown once in UI, never stored |
| `seatCount` | `int` | |
| `endDate` | `LocalDate` | `null` if open-ended ACTIVE; set if TRIAL |

**Critical: `temporaryPassword` is returned only in this response.** It is not stored anywhere accessible after this call. The SUPER_ADMIN must copy it from the success modal. There is no backend route to retrieve it again.

#### Error cases the UI must handle

| HTTP | Cause |
|---|---|
| 409 Conflict | Duplicate `adminEmail` or duplicate `organisationName + country` |
| 400 Bad Request | Validation failure (field-level errors in `errors[]` array) |
| 422 / 400 | `planId` not found or plan is inactive |
| 500 | Auth-service gRPC failure — transaction rolls back; tenant and licence rows are NOT persisted |

---

### 1.2 `GET /api/v1/super-admin/tenants` — List Tenants

**Controller:** `SuperAdminController.java:89-105`

#### Query parameters

| Param | Type | Notes |
|---|---|---|
| `status` | `String` | Comma-separated `TenantStatus` values: `ACTIVE,TRIAL,SUSPENDED,CANCELLED` |
| `planId` | `UUID` | Accepted by controller but **not wired into service** — ignored silently |
| `search` | `String` | Accepted by controller but **not wired into service** — ignored silently |
| `page` | `int` | 0-indexed (Spring Pageable) |
| `size` | `int` | |
| `sort` | `String` | e.g. `createdAt,desc` |

**Gap — `planId` and `search` filters are dead parameters.** The controller accepts them but `filterTenants()` only branches on `status`. Server-side search and plan filtering are not implemented. The list page must either omit search/plan-filter UI or note these as deferred.

#### Response: `Page<TenantSummaryResponse>`

| Field | Type | Notes |
|---|---|---|
| `tenantId` | `UUID` | Use for row click → detail |
| `organisationName` | `String` | |
| `status` | `String` | `.name()` of `TenantStatus` enum — uppercase |
| `planName` | `String` | From current licence, falls back to plan on tenant |
| `seatCount` | `Integer` | From current licence; nullable |
| `endDate` | `LocalDate` | Trial expiry or licence end; null if open-ended |
| `adminEmail` | `String` | |
| `createdAt` | `LocalDateTime` | |

**Gap — no employee count in `TenantSummaryResponse`.** Employee count requires a cross-service call to employee-service. It is not available on the tenant list without a new gRPC call per row (N+1) or an async denormalised counter. The list table should omit this column for now.

---

### 1.3 `GET /api/v1/super-admin/tenants/{tenantId}` — Tenant Detail

**Controller:** `SuperAdminController.java:107-110`

Returns `TenantDetailResponse` which adds `kraPin`, `nssfNumber`, `shifNumber`, `payFrequency`, `payDay`, `suspensionReason`, `trialEndsAt`, and the full `LicenceResponse` object. The detail page (`/tenants/{id}`) is deferred — it ships with Flow 1 implementation but is not in scope for the list or create form.

---

### 1.4 `GET /api/v1/plans` — Available Plans (public)

**Controller:** `PlanController.java`  
**Auth:** None — this endpoint is in `GatewayPublicPaths.EXACT`. The create form can call it without a token.

#### Response: `List<PlanResponse>`

| Field | Type |
|---|---|
| `id` | `UUID` |
| `name` | `String` |
| `tier` | `String` |
| `monthlyPrice` | `BigDecimal` |
| `currency` | `String` |
| `maxEmployees` | `int` |
| `maxAdmins` | `int` |
| `payrollEnabled` | `boolean` |
| `leaveEnabled` | `boolean` |
| `attendanceEnabled` | `boolean` |
| `documentsEnabled` | `boolean` |
| `analyticsEnabled` | `boolean` |

The form uses `id` as the `planId` value and displays `name` + `tier` as the label. `monthlyPrice` is in KES and can be used as the default `agreedPriceKes` suggestion (SUPER_ADMIN can override).

---

## 2. Gateway Routing

### 2.1 Routed requests — `SuperAdminAuthFilter`

All `/api/v1/super-admin/**` requests routed through the gateway use `SuperAdminAuthFilter`. This filter:
- Validates the JWT
- Asserts `role == SUPER_ADMIN`
- Rejects with 403 otherwise

The platform-portal BFF proxy (`/api/proxy/[...path]/route.ts`) forwards these requests with the `platform_token` cookie value as `Authorization: Bearer {token}`. The filter sees a valid SUPER_ADMIN JWT.

### 2.2 Local gateway controller — inline auth

`SuperAdminSystemController` at `/api/v1/super-admin/system/health` is served by the gateway itself (not routed). Spring Cloud `GlobalFilter` does not run for local `@RestController` endpoints. This controller performs its own JWT role check inline. This is already shipped and working.

### 2.3 Public plans endpoint

`GET /api/v1/plans` is in `GatewayPublicPaths.EXACT`. No JWT needed. The create form can call this directly from the browser via the BFF proxy (the BFF proxy's allowed prefix list includes `/api/v1/plans`).

---

## 3. Credential Delivery Gap

### 3.1 What exists

`TenantEventListener.handleTenantCreated()` sends a welcome email to the new tenant admin with onboarding tips. It does **not** include the temporary password.

`AuthEventListener.handleProvisioned()` sends a credential email (username + temp password) when an **employee** is provisioned via the employee-service flow. This path does not run for tenant admin provisioning.

### 3.2 The gap

The tenant admin's temporary password is returned in `ProvisionedTenantResponse.temporaryPassword` to the SUPER_ADMIN only. The admin provisioning path in `auth-service` (called via gRPC by `SuperAdminTenantService`) does not trigger a credential email. The SUPER_ADMIN must manually share the password out-of-band.

**This is a known, intentional gap per the current design.** The success modal in the create form must make this explicit: display the password prominently, provide a copy button, and include a warning that it will not be shown again and must be shared manually.

A future improvement (not in Flow 1 scope) would have `auth-service` emit a provisioned event for the tenant admin that `notification-service` picks up to send a credential email.

---

## 4. Existing UI Primitives

All components available in `@andikisha/ui`:

| Component | Used for |
|---|---|
| `PageHeader` | Page titles on both pages |
| `DataTable` | Tenant list table |
| `Badge` | Status column in list |
| `StatCard` / `KpiGroup` | Not needed in Flow 1 |
| `InlineAlert` | Error states, warnings |
| `Button` | Actions |
| `MoneyAmount` | Displaying `agreedPriceKes` in the success modal |

**Not available — must be built in-app:**
- Multi-field form with validation display (no form primitives in `@andikisha/ui`)
- Plan selector (dropdown with `PlanResponse` items)
- Success modal with password copy button
- Status filter tabs above the DataTable

The form controls use native HTML `<input>` / `<select>` styled with Tailwind. No third-party form library is in the stack.

---

## 5. Navigation State

From `navConfig.ts`:

```
Tenants → /tenants           ← Flow 1 builds this
  All Tenants → /tenants
  Provision Tenant → /tenants/new   ← Flow 1 builds this
  Feature Flags → /tenants/feature-flags   ← unbuilt
  Usage Metrics → /tenants/usage           ← unbuilt
```

The `Billing`, `Compliance`, `Integrations`, `Support`, `Users`, `Audit`, `System`, `Communications`, `Settings` top-level items all point to unbuilt pages. The dashboard and `/tenants` (Flow 1) are the only shipped routes.

Open question carried into the design doc: how should the nav handle links to unbuilt pages?

---

## 6. Summary of Gaps

| Gap | Severity | Resolution |
|---|---|---|
| `search` and `planId` filter params accepted but ignored by service | Low | Omit from list page UI in Flow 1 |
| Employee count not in `TenantSummaryResponse` | Low | Omit column from list table |
| Credential email not sent to tenant admin | Medium | Success modal must show and warn; document as known limitation |
| Tenant detail page not yet built | Low | `/tenants/{id}` stub — row click navigates there; detail ships as part of Flow 1 implementation |
| Nav items pointing to unbuilt pages | Low | Design decision needed (see design doc) |
