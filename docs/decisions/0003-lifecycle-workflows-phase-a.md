# 0003 — Run L1: Employee Lifecycle Workflows — Phase A Audit & Decisions

**Status:** Approved (Phase A) — Phase B in progress on `feature/lifecycle-workflows`
**Date:** 2026-07-15
**Scope:** Onboarding & offboarding workflow module in `employee-service` + tenant-portal UI. Release 01. Does not touch the (non-existent) Recruitment Service.

> Naming note: the repo's other decision records are date-prefixed. This file uses the
> `0003-` ADR-style name specified in the Phase B run prompt.

---

## Decisions taken on the Phase A findings

**D1 — Termination event model (as recommended).** Offboarding completion routes through
the existing `EmployeeService.terminate()` path, producing exactly one
`EmployeeTerminatedEvent` on the existing `employee.terminated` routing key. The module adds
only three new events on the `employee.events` exchange: `OnboardingStartedEvent`,
`OnboardingCompletedEvent`, `OffboardingStartedEvent`. No second termination-class event is
ever defined or published.

**D2 — Archive model (approved).** No new `EmploymentStatus` value. Reuse `TERMINATED` and add
an `archived_at` timestamp column to `employees` in Flyway `V11`. "Archive, never delete" =
set `archived_at`, keep the row. Default admin list queries exclude archived employees; the
existing "Archived employees" view surfaces them.

**D3 — Certificate of Service (amended, not as recommended).** No certificate task in the
default offboarding template — the draft only exists after termination fires, so a
pre-completion checklist item for it is unsatisfiable. Instead, a COMPLETED offboarding
instance renders a post-completion hint in the detail panel pointing HR to the auto-created
draft in Documents (issued there via the existing `POST /api/v1/documents/{id}/issue`).
`DOCUMENT-BACKLOG-002` (sync generate endpoint) stays filed.

**D4 — Notifications (approved).** No new notification wiring in this run. The pipeline boards
and the `/my/dashboard` card are the v1 surfaces. `NOTIFICATION-BACKLOG-002` stays filed.

## Phase B adjustments (both bind W1)

**Adjustment 1 — Onboarding completion changes no employment status.** Completing the final
ONBOARDING task fires `OnboardingCompletedEvent` and closes the instance. It must NOT call
`confirmProbation()` and must NOT transition `EmploymentStatus`. Probation confirmation stays a
separate managerial action via its existing endpoint.

**Adjustment 2 — Direct termination cancels open offboarding.** `POST /employees/{id}/terminate`
remains fully available. When called while the employee has an open OFFBOARDING instance, that
instance transitions to CANCELLED with a system note ("Closed by direct termination"), in the
same transaction as the termination. There must never be two open paths to the same exit.

---

## Phase A report (verbatim)

### Headline: two facts reshape the run before any code

1. **`EmployeeTerminatedEvent` is not greenfield.** It already exists, is published on the existing `terminate()` flow (`employee.terminated`), and is consumed by 6 services — including document-service, which already auto-generates the Certificate of Service draft off it. Publishing it again on offboarding completion double-fires cert generation, payroll exit, notification, audit, and analytics. (→ D1.)
2. **The status vocabulary in the brief doesn't exist.** The real enum is `EmploymentStatus {ACTIVE, ON_PROBATION, ON_LEAVE, SUSPENDED, TERMINATED}` — there is no "pre-active" and no "EXITED" state. "Pre-active" maps to `ON_PROBATION`; "EXITED/archived" does not exist. (→ D2.)

### A1 — Employee Service inventory

- Entities: `Employee` (aggregate root, holds all status methods), `Department`, `Position`, `EmployeeHistory` (append-only audit), `SalaryStructure` (embeddable). Enums `EmploymentStatus`, `EmploymentType`, `Gender`.
- Status transitions live in the `Employee` aggregate. Only two are wired to endpoints: `terminate()` (`POST /employees/{id}/terminate`) and `confirmProbation()` (`ON_PROBATION → ACTIVE`, `POST /employees/{id}/confirm-probation`). `suspend/reinstate/markOnLeave/returnFromLeave` exist but are never called (SUSPENDED/ON_LEAVE unreachable today).
- Events published (exchange `employee.events`, topic): `EmployeeCreatedEvent` (`employee.created`), `EmployeeUpdatedEvent` (`employee.updated`), `EmployeeTerminatedEvent` (`employee.terminated`), `SalaryChangedEvent` (`employee.salary_changed`).
- Remnants: none. Clean greenfield module.
- Next Flyway version: `V11` (highest existing is V10, immutable).

### A2 — Integration reality check

- Certificate of Service: no synchronous "generate" endpoint. Generation is event-driven (on `employee.terminated`, document-service builds a DRAFT). Only sync action is `POST /api/v1/documents/{id}/issue` on an already-existing draft. → offboarding "certificate" step is manual/hint; file backlog for a sync generate API.
- Notifications: channels `EMAIL/SMS/PUSH/IN_APP` reusable via `NotificationService.sendNotification`, but no template engine and no generic "task assigned / action required" type — every notification is a domain-specific listener with hard-coded copy. notification-service already emits an `OFFBOARDING` notification off `EmployeeTerminatedEvent`.
- Termination event: confirmed already live and consumed by 6 services. No conflicting differently-named event.

### A3 — Frontend & BFF proxy audit (mandatory FE-BACKLOG-015 check)

- Proxy verdict: safe iff every new endpoint is namespaced under `/api/v1/employees/...`. The allowlist entry `"/api/v1/employees"` and gateway route `Path=/api/v1/employees/**` both match by prefix. Any new top-level prefix (`/api/v1/lifecycle`, `/api/v1/tasks`, `/api/v1/my`, `/api/v1/onboarding`) → 403-at-proxy + 404-at-gateway. Hard constraint on W1's URL design.
- No board/kanban primitive and no `Card` primitive (FE-BACKLOG-002) — stage board built from `DataTable`, `Badge`, `StatCard`, `Sheet` (detail panel), `Dialog` (confirms), `Checkbox` (task ticks).
- Single canonical design-system bundle (no rogue root copy). Zero stale font imports on target files; all `lucide-react`.
- Convention: `[workspace]/(admin)/admin/employees/*` and `(my)/my/*` route groups; client-side React Query over `apiClient` (`baseURL: /api/proxy`).

### A4 — RBAC mapping

- Admin pages inherit protection for free under the `(admin)` route group — Edge middleware (`middleware.ts:108-120`), `AdminRoleGuard` layout wrapper, shared `ADMIN_ROLES` set (`auth.ts:10`). Add nav items in `AdminNav.tsx`.
  - Caveat: `ADMIN_ROLES` also admits `HR_OFFICER`/`PAYROLL_OFFICER` and has no read-only tier. "HR read-only" must be enforced by backend `@PreAuthorize` on writes (`hasAnyRole('HR_MANAGER','ADMIN')`) + `PermissionGate` around write controls. Use `HR_OFFICER` — `HR` was deprecated in V15.
- Own-record pattern to copy for task completion: `LeaveController.balances` SpEL Form A (`#employeeId.toString().equals(#callerEmployeeId)`, using `@RequestHeader("X-Employee-ID")`) or `LeaveService.cancel` Form B (service-layer owner compare, throws `NOT_OWNER`). Gateway injects trusted `X-Employee-ID` (`JwtAuthenticationFilter.java:102`).
  - Do NOT copy `EmployeeController.getById:86` — it uses the broken `authentication.name` (userId ≠ employeeId) form (SEC-BACKLOG-001 class).

### Consolidated severity

| Sev | Finding |
|---|---|
| Critical | `EmployeeTerminatedEvent` already live + consumed by 6 services → reuse existing termination path once (D1). |
| High | Status vocab mismatch (no "pre-active"/"EXITED") → map pre-active→ON_PROBATION; archive via `archived_at` (D2). |
| High | All new endpoints must be namespaced under `/api/v1/employees/**` or 403+404. |
| High | No sync Cert-of-Service generate endpoint → offboarding cert is a post-completion hint (D3). |
| High | Task-completion authz must use `X-Employee-ID`, not `authentication.name`. |
| Medium | No generic task-assignment notification/type/template (D4 defers). |
| Medium | No board/`Card` primitive → compose from existing primitives. |
| Medium | Admin route gate has no read-only tier → enforce HR read-only at backend + PermissionGate. |
| Low | Dead status methods; `startsWith` allowlist boundary; TenantLicenceFilter gates lifecycle routes. |

### Backlog items filed

| ID | Item |
|---|---|
| `LIFECYCLE-BACKLOG-001` | `CreateEmployeeFromCandidate` gRPC RPC / recruitment integration — no caller yet. |
| `LIFECYCLE-BACKLOG-002` | Asset-return automation — Asset Service doesn't exist; offboarding asset tasks stay manual. |
| `LIFECYCLE-BACKLOG-003` | Final-pay computation integration — payroll owns money; offboarding only links. |
| `DOCUMENT-BACKLOG-002` | Synchronous "generate Certificate of Service" endpoint (today: event-driven only). |
| `NOTIFICATION-BACKLOG-002` | Generic "task-assigned / action-required" notification type + template. |
</content>
</invoke>
