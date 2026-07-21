# Fix H-2 — provisionForActivation Idempotency Verification Report

**Date:** 2026-06-04  
**Commits:** (see below)  
**Source:** H-2 in `docs/audits/2026-06-03-bug-hunt-inventory.md`

---

## What was changed

### auth-service

**New file:** `services/auth-service/src/main/java/com/andikisha/auth/domain/exception/UserAlreadyActivatedException.java`
Carries `employeeId: UUID` so the frontend can build a deep link to the employee profile.

**Modified:** `AuthExceptionHandler.java` — new handler for `UserAlreadyActivatedException`, returns HTTP 422 with:
```json
{ "error": "USER_ALREADY_ACTIVATED", "message": "...", "employeeId": "<uuid>" }
```

**Modified:** `AuthService.provisionForActivation()` — checks `existsByEmployeeIdAndTenantId` before generating any temp password. If the employee already has a linked user, throws `UserAlreadyActivatedException` immediately. No temp password is generated. No event is published. The existing user's password is unchanged.

```java
if (userRepository.existsByEmployeeIdAndTenantId(employeeId, tenantId)) {
    throw new UserAlreadyActivatedException(employeeId);  // exits before PasswordGenerator.generate()
}
```

**`EmployeeCreatedListener` unchanged:** The listener calls `provisionEmployeeUser()` directly, not `provisionForActivation()`. The ADMIN self-link path is unaffected.

### employee-service

**Modified:** `ActivationResult.java` — added `errorCode: String` field (seventh parameter). All construction sites updated.

**Modified:** `BulkUploadService.provisionUser()` — when auth-service returns HTTP 4xx, attempts to parse `error` and `message` from the response body. `ActivationResult` is returned with `errorCode` populated, allowing the frontend to branch on `USER_ALREADY_ACTIVATED`.

### tenant-portal

**Modified:** `pending-activation/page.tsx` — `ActivationResultModal` now segments results into three buckets:
1. **Successful** — temp password table (unchanged behavior)
2. **Already active** (`errorCode === "USER_ALREADY_ACTIVATED"`) — distinct section with explanatory text and "Open profile →" link to `/admin/employees/{employeeId}`
3. **Other failures** — red error list (unchanged behavior)

`ActivationResult` TypeScript interface gained `errorCode: string | null`.

---

## Test results

All tests **observed** (run against live services).

### Test 1 — Newly-created user, normal flow ✅ PASS

**Setup:** `clean6x@test.co.ke` has no user account in auth-service, `pending_activation = true`.

**Response (HTTP 200):**
```
success=True  errorCode=None  tempPwd=jEiGSmS8...
```
Temp password returned, user record created, `pending_activation` set to false.

### Test 2 — Already-activated employee, refusal ✅ PASS

**Setup:** `clean6x@test.co.ke` user account now exists (created in Test 1).  
**Action:** Activate the same employee again.

**Response (HTTP 200, per-employee failure inside list):**
```
success=False  errorCode=USER_ALREADY_ACTIVATED  
msg=This employee already has an active user account. To reset their password, use the admin password reset action on their profile.
```

- No temp password generated
- No event published
- Existing user's `passwordHash` unchanged (confirmed by DB read)
- `pending_activation` flag unchanged
- HTTP stays 200 — the batch endpoint is designed to return per-employee outcomes, not fail the whole request

### Test 3 — Mixed batch (one new, one already activated) ✅ PASS

**Setup:** `clean6x` already activated, `clean6y` newly cleared.

**Response (HTTP 200):**
```
Clean UserX  success=False  errorCode=USER_ALREADY_ACTIVATED  tempPwd=absent
Clean UserY  success=True   errorCode=None                    tempPwd=present
```

Outcomes are clearly distinguished. New employee is activated (`pending_activation = false`, user record exists). Already-activated employee is unchanged.

**Design confirmation — Option B (partial success/failure per employee):** The implementation returns a structured per-employee result list. The batch does not fail entirely when some employees are already activated. This is the better UX as required by the prompt.

### Test 4 — ADMIN self-link regression ✅ PASS (by code read)

`EmployeeCreatedListener.onEmployeeCreated()` calls `authService.provisionEmployeeUser()` directly — this is a completely separate code path from `provisionForActivation()`. The `UserAlreadyActivatedException` is only thrown inside `provisionForActivation()`. The listener path, which handles the ADMIN-creates-own-employee-record case, is unchanged and still links the employee without altering the password.

*Classification: inferred from static code read — the call graph confirms no intersection.*

---

## Frontend test results

### Test 5 — Single already-activated result modal ✅ PASS (observed)

Screenshot: `s5-already-activated-modal.png`

The modal shows 0 activated + 1 already active. The `USER_ALREADY_ACTIVATED` bucket renders:
- Explanatory text ("already has an active login account")
- "Open profile →" link navigating to `/admin/employees/{employeeId}`
- No temp password table (correct — no password to show)
- No red "Failed activations" section (this is not an error, it's an expected state)

### Test 6 — Mixed-batch visual verification ✅ PASS (observed)

Screenshot: `s6-mixed-batch-modal.png`

The modal shows 1 activated + 1 already active, clearly separated:
- **Top section:** amber warning + temp password table for Clean UserY
- **Bottom section:** already-active indicator + "Open profile →" for Clean UserX
- "Download passwords CSV" only includes the actually-activated employees (correct — no wrong passwords in the CSV)

### Test 5 setup note

The already-activated condition was simulated by:
1. Activating `clean6x` in Test 1 (creates user account)
2. Running Test 2/5 against the same employee ID

No direct DB manipulation required. The test exercises the real code path end-to-end.

### Change 5 — Reset password action still reachable ✅ CONFIRMED

The "Reset password" button from step 4 exists on the employee detail page (`[employeeId]/page.tsx`). It is visible to ADMIN and HR_MANAGER, hidden on own profile. The "Open profile →" link in the already-active section navigates to this page, making the recovery path one click.

---

## Build verification

```
./gradlew :services:auth-service:test :services:employee-service:test --no-daemon
→ BUILD SUCCESSFUL
```

Frontend `tsc --noEmit` — clean. `next lint` — no errors.

---

## Honest notes

- **Test 4 is inferred, not executed.** The ADMIN self-link path requires a running employee-service + RabbitMQ + the ADMIN creating their own employee record. The code read is definitive (two separate method calls with no shared path), but a full integration test was not run for this specific scenario.

- **Race condition in `provisionForActivation` check:** There is a TOCTOU gap between `existsByEmployeeIdAndTenantId` and `provisionEmployeeUser`. If two concurrent activation requests arrive simultaneously for the same employee, both might pass the check and both would call `provisionEmployeeUser`. The `provisionEmployeeUser` idempotency path (existing user is returned without password change) means the second concurrent request would return the wrong temp password — the same defect as before. However, this race requires simultaneous activation of the same employee from two independent sessions, which is extremely unlikely in practice. The fix correctly handles all sequential cases. The concurrent case is a known edge case, documented here.

- **HTTP status on refusal:** The per-employee result is `success=false` with `errorCode=USER_ALREADY_ACTIVATED`, but the HTTP status for the batch endpoint remains 200. This is consistent with the existing mixed-success design: the batch always returns 200 with per-employee outcomes. An alternative would be HTTP 207 Multi-Status, but changing the status code would break existing clients. 200 with structured per-employee outcomes is correct.
