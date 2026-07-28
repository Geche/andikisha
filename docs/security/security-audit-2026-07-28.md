# AndikishaHR Security Audit — 2026-07-28

**Method:** Adversarial multi-agent audit. 10 auditors (one per vulnerability class) swept all
services for concrete, file:line-anchored findings; every finding was then challenged by **two
independent skeptics** (exploitability lens + already-mitigated lens). A finding is **CONFIRMED**
only if both skeptics agreed it is real and unmitigated, **PLAUSIBLE** if one did, **REFUTED**
(dropped) if neither. A completeness critic then flagged under-examined areas.

**Coverage caveat:** the first run's verification phase was truncated by a usage limit; it was
resumed to completion (87/87 agents, 0 errors). Two highest-stakes items (committed secrets, the
gRPC/trusted-header trust boundary) were additionally hand-verified by the maintainer session.

**Result:** 38 raw findings → **19 kept** (15 confirmed, 4 plausible), 19 refuted. **0 Critical,
5 High (distinct), 8 Medium, 6 Low/Info.** No confirmed remote-unauthenticated total compromise;
the serious cluster is money-integrity (payroll double-pay) and one internet-reachable recon/SSRF
surface (gateway actuator).

---

## HIGH (distinct)

### H1 — Unauthenticated Spring Cloud Gateway actuator on the public port
`services/api-gateway/src/main/resources/application.yml:440`
`management.endpoints.web.exposure.include: …,gateway` with `management.endpoint.gateway.enabled:
true`, no `management.server.port` override, so actuator shares the internet-facing 8080. The JWT
enforcement is a Gateway **GlobalFilter** — it runs only for requests a *route predicate* matches,
and no route matches `/actuator/**`, so actuator bypasses auth entirely; Spring Security is
`anyExchange().permitAll()`.
**Impact:** `GET /actuator/gateway/routes` discloses the full internal topology (every backend
URI/port, predicates, which routes carry SuperAdmin/Licence filters). The endpoint also registers
**mutating** ops (`POST /routes/{id}`, `POST /refresh`, `DELETE /routes/{id}`) → route-swap
SSRF/MITM and route-deletion DoS. `/actuator/metrics` and `/actuator/info` leak ops/build data.
**Fix:** drop `gateway` (and `metrics`) from the exposure list, or bind actuator to an internal-only
`management.server.port`; add a Security matcher requiring auth on `/actuator/**` except
`health`/`info`. Do **not** rely on the GlobalFilter.

### H2 — M-Pesa B2C result callback has no cryptographic verification
`services/integration-hub-service/.../presentation/controller/MpesaCallbackController.java:24`
Public, unauthenticated `POST /api/v1/callbacks/mpesa/b2c/result` binds a raw `Map` and drives
`paymentService.handleMpesaCallback`, which marks the transaction COMPLETED (attacker-supplied
receipt) or FAILED with **no signature/HMAC/shared-secret** and **no state guard** (markCompleted/
markFailed overwrite any status). The only control, `MpesaSourceIpFilter`, is (a) disableable via
`mpesa.callback.ip-validation-disabled` and (b) reads `getRemoteAddr()` ignoring `X-Forwarded-For`
— behind the gateway it sees the proxy IP, so to work at all the operator must disable it or
allowlist the proxy, which then admits any actor reaching the pod.
**Impact:** with a valid/guessed ConversationID, forge ResultCode 0 + receipt → real payment shows
COMPLETED though unpaid (run closes, missing disbursement hidden); ResultCode≠0 → genuine payment
FAILED → operator/`retryFailed` re-disburses → double payment. Friction: ConversationID is not in
the API response DTO, so needs a leak/insider/race (why HIGH not Critical).
**Fix:** high-entropy secret path segment or shared-secret token in the registered callback URL,
verified per call; validate source IP at the ingress with the real client address; refuse to boot
with ip-validation disabled in prod; add a terminal-state guard.

### H3 — Disbursement lock released before async B2C sends complete; no status guard before `sendB2C`
`services/integration-hub-service/.../application/service/PaymentService.java:101`
`processBatchPayments` holds the per-run Redis lock only for the fast dispatch loop then deletes it
in `finally`, while `processPayment` is `@Async` and `processMpesaPayment` calls `sendB2C` with no
PENDING/status check and before any save (`@Version` can't help — the send precedes persistence).
**Impact:** operator clicks disburse again while tasks still show PENDING (or the run is reprocessed)
→ each payment sent twice.
**Fix:** hold the lock until all sends reach terminal state, or flip run status PENDING→PROCESSING
atomically inside the lock before dispatch; reload the row `FOR UPDATE` and abort if `status !=
PENDING` before `sendB2C`.

### H4 — Payroll event reprocessing creates a second full set of payment transactions
`services/integration-hub-service/.../infrastructure/messaging/PayrollEventListener.java:48`
`createMpesaTransaction` does an unconditional insert with **no idempotency key**, and
`V2__create_payment_transactions.sql` has **no unique constraint** on `(payroll_run_id, pay_slip_id)`
— only non-unique indexes. Duplicate rows are creatable and all PENDING rows get disbursed.
**Note:** the *automatic* RabbitMQ-redelivery vector is mitigated (`setDefaultRequeueRejected(false)`
+ DLQ, so a failed listener dead-letters, not loops) — but any reprocess path (manual replay, DLQ
re-drive, a second approve) double-pays the whole run.
**Fix:** UNIQUE `(tenant_id, payroll_run_id, pay_slip_id)`; `createMpesaTransaction` upserts / skips
if exists; wrap create+dispatch in an idempotent consumer keyed on event id.

### H5 — Leave IDOR: any employee can read any colleague's full leave history
`services/leave-service/.../application/service/LeaveService.java:335`
`GET /api/v1/leave/employees/{employeeId}/requests` is `@PreAuthorize(hasAnyRole(…,'EMPLOYEE'))` and
`listEmployeeRequests` queries by the **raw path `employeeId`**, tenant-filtered only, with no
ownership check — unlike its sibling `getRequest`/`enforceReadAccess`, whose Javadoc explicitly
names this exact IDOR. Leaks leave type (SICK/MATERNITY/PATERNITY), dates, free-text reasons;
iterating UUIDs dumps the whole tenant. (Surfaced by both the authz and tenant-isolation auditors.)
**Fix:** pass `X-User-Role`/`X-Employee-ID` into `listEmployeeRequests` and enforce the same
OWN/DEPARTMENT scope as `enforceReadAccess`/payroll `enforcePayslipOwnership`, or drop EMPLOYEE from
the `@PreAuthorize` and route employees to the OWN-scoped list.

---

## MEDIUM

### M1 — Domain services trust unauthenticated `X-Tenant-ID`/`X-User-Role` with no gateway-origin proof
`services/leave-service/.../presentation/filter/TrustedHeaderAuthFilter.java:32` (pattern in all
domain services). Any request reaching a service port directly (misconfigured ingress, SSRF, a
compromised in-cluster workload) with `X-User-Role: ADMIN` + `X-Tenant-ID: <victim>` is granted that
role/tenant. Defense-in-depth: prod publishes **no** service ports (only gateway/frontends), so not
currently externally reachable — but there is nothing *in the app* enforcing gateway-origin.
**Fix:** require a gateway-injected signed/secret internal header (or mTLS peer identity) and reject
requests lacking it; enforce with NetworkPolicy that service ports accept only gateway traffic.

### M2 — gRPC internal plane has zero authn/authz (plaintext, trusts request-body tenant)
`services/employee-service/.../infrastructure/grpc/EmployeeGrpcService.java:43` (pattern in every
`@GrpcService`). No `ServerInterceptor` anywhere, `negotiation-type: plaintext`, and each handler
does `TenantContext.setTenantId(request.getTenantId())`. Any actor that can open a channel to
9082–9092 reads/writes **any** tenant's employees/salaries/payslips/leave/attendance with **no
credential**. Same reachability caveat as M1 (ports internal-only in current prod). Surfaced by the
completeness critic; hand-verified.
**Fix:** a gRPC `ServerInterceptor` validating a shared internal token or the caller's JWT, and/or
mTLS between services; NetworkPolicy restricting the gRPC ports.

### M3 — Account-lockout response leaks account existence (user enumeration)
`services/auth-service/.../application/service/AuthService.java:271`. A locked (real) account returns
`429 ACCOUNT_LOCKED`; a non-existent email never locks and stays `401 INVALID_CREDENTIALS`. Six
garbage logins per candidate email → deterministic yes/no oracle, defeating the deliberately-vague
message. Same for SUPER_ADMIN.
**Fix:** on a locked account return the same `401 INVALID_CREDENTIALS` body/status as a wrong
password; keep the lock server-side.

### M4 — Login timing oracle
`services/auth-service/.../application/service/AuthService.java:276`. BCrypt runs only for existing,
active, unlocked users; missing/inactive emails throw immediately. The tens-of-ms delta enumerates
valid accounts (the body/status oracle is already closed, so timing is the sole channel).
**Fix:** constant-work dummy BCrypt comparison on the absent/inactive/locked branches.

### M5 — Login brute-force/spray protection ineffective
`frontend/tenant-portal/src/app/api/auth/login/route.ts:43`. BFF limiter keys on the client-supplied
`X-Forwarded-For` (rotate it → new bucket every request) and is in-memory per-instance; the
platform-portal super-admin login has **no** limiter; the gateway default allows 50 req/s/IP. Account
lockout is per-account so a low-per-account spray never trips it.
**Fix:** server-side throttle at gateway/auth keyed on a *trusted* client IP and the target email,
strict low limit on `/auth/login`, `/auth/super-admin/login`, `/auth/forgot-password`; add a real
limiter to the platform-portal route.

### M6 — Account-lockout DoS (single SUPER_ADMIN amplifies to platform-admin DoS)
`services/auth-service/.../domain/model/User.java:78`. 5 failed logins lock an account 30 min with no
IP binding; anyone knowing an email can hold it locked. The single SUPER_ADMIN account (one-per-
system) shares the mechanism → repeatable 30-min platform-admin lockouts.
**Fix:** IP/device-aware throttling + backoff instead of a globally-triggerable hard lock; for
SUPER_ADMIN prefer out-of-band unlock/alerting; pair with strict per-IP rate limiting.

### M7 — Open redirect in platform-portal login
`frontend/platform-portal/src/app/login/page.tsx:16`. `safeReturnTo` accepts `//evil.com`
(`startsWith("/")` passes protocol-relative), and on success `router.replace` hard-navigates
cross-origin — post-login phishing of a freshly-authenticated SUPER_ADMIN.
**Fix:** reject 2nd char `/` or `\`; better, `new URL(decoded, origin)` and require `origin` match.

---

## LOW / INFO

- **L1** `AuthService.java:342` — password change/reset revokes refresh tokens but not already-issued
  access JWTs; a stolen access token stays valid ≤1h. Documented accepted-risk; add a
  `tokensValidAfter`/jti denylist for the "I was compromised" flow. (CONFIRMED)
- **L2** `SuperAdminAuthService.java:62` — provision-secret oracle: secret checked before the
  already-provisioned check → 422 vs 409 distinguishes a valid secret (internal-only reachable post
  PR #104). Check provisioned-state first; constant-time compare; rate-limit. (PLAUSIBLE)
- **L3** `PaymentService.java:144` — callback idempotency key set before the DB commit; a callback
  racing ahead of `markSubmitted` can permanently dedupe the real callback and strand a payment.
  Record the key atomically with the status change. (PLAUSIBLE)
- **L4** `AfricasTalkingSmsSender.java:41` — logs full recipient phone + message body (possible OTP)
  at INFO. Mask/drop; move to DEBUG. (PLAUSIBLE)
- **L5** `AuditExceptionHandler.java:16` — returns raw exception message, overriding the sanitizing
  global handler. Delete it or return a fixed message. (CONFIRMED)
- **L6** `SecurityConfig.java:67` — spring-security-crypto 6.4.2 BCrypt >72-byte weakness
  (CVE-2025-22228). Bump spring-security ≥ 6.4.4. (PLAUSIBLE/INFO)

---

## Refuted / down-rated (with reason)

- **Committed secrets** (`config/env/.env.local`, `application-dev.yml`) — refuted as a *production*
  risk: prod runs `SPRING_PROFILES_ACTIVE=prod` (dev yml never loads), prod secrets come from the
  Dokploy env, and prod compose never references `.env.local` (hand-verified). **Still a hygiene fix**
  — `.env.local` is git-tracked with a real dev `JWT_SECRET`: purge from tracking, add to
  `.gitignore`, and rotate that key if it was ever used anywhere reachable.
- **Netty 4.1.115 / Tomcat 10.1.34 CVEs** — refuted on reachability; worth a routine BOM bump.
- **Employee self-access SpEL (User vs Employee UUID)** — refuted; confirm SEC-BACKLOG-001 is closed.
- **BFF proxy allowlist bypass, middleware `x-employee-id` spoof, `COOKIE_SECURE` disable, unbounded
  pagination, PDF `img src` concat, super-admin refresh-token not persisted, provision DTO no
  `@Valid`** — refuted as not concretely exploitable in current code/config; several are still worth
  hardening opportunistically.

---

## Proposed remediation order

1. **High, immediate (this slice):** H1 (config, minutes) → H5 (mirror existing scope check) →
   H2/H3/H4 money-integrity (one integration-hub PR: callback secret+state-guard, hold-lock+status-
   guard, unique constraint+idempotent create). Each with tests (TDD).
2. **Medium batch:** M3/M4/M6 (auth-service enumeration+lockout — cohesive), M5 (rate limiting),
   M7 (open redirect), then M1/M2 (internal trust boundary — shared internal-auth secret / interceptor
   + NetworkPolicy; larger, design-touching).
3. **Low/hygiene:** L1–L6 + the refuted-but-worthwhile hardening (secret purge, dependency bumps).
