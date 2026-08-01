# AESS W6 — browser verification script (AUTH-BACKLOG-001)

Self-contained steps for the manual browser pass. Written so it runs without re-reading the spec.

**Scope:** the admin employee self-service flow (`SetMeUpAsEmployeeCard` → `POST /api/v1/employees/self`
→ auto-link → re-login → `/my/*`). Backend contract is already covered by automated tests (W4); this
pass is the parts curl cannot prove.

## Prerequisites

- Full stack up: tenant-portal (3000), api-gateway (8080), auth-service, employee-service,
  leave-service, time-attendance-service, payroll-service, their Postgres DBs, RabbitMQ, Redis.
- Apply migrations first, including **V12** (`idx_employees_tenant_email_unique`) on the employee DB.
  Run the duplicate pre-check embedded in V12 before deploying it; it must return no rows.
- A tenant **ADMIN account with no employee record** (fresh provisioned tenant admin, or an existing
  admin whose email has no matching employee row). Confirm via `GET /api/auth/me` → `employeeId` absent.
- **Browser DevTools → Network → throttling set to "Slow 3G"** for the whole pass.
- Capture a screenshot at every step marked 📷.

## Steps

**1 — Card visible for an unlinked admin.**
Log in as the admin, land on `/{workspace}/admin/dashboard`. The "Set yourself up as an employee" card
renders near the top (above the KPI strip). 📷
- Pass: card present. Fail: absent, or an error.
- Also confirm (separate logins, or accounts): the card renders for **HR_MANAGER, HR_OFFICER,
  PAYROLL_OFFICER** accounts that have no employee record (eligibility is by state, not role). 📷 each.
- Negative: a SUPER_ADMIN (platform portal) and an admin who **already** has an `employeeId` must NOT
  see it.

**2 — Modal pre-fill, email read-only.**
Click "Set me up as an employee". The modal opens with **first/last name pre-filled** from
`/api/auth/me` (split from the display name; blank if none), **phone empty** (optional), and **email
read-only/disabled** showing the account email. 📷
- Pass: name pre-filled, email visibly non-editable. Fail: email editable, or fields blank when a
  display name exists.

**3 — Submit → poll → nudge only after link confirms.**
Fill/adjust name, submit. Under Slow 3G, observe: the modal closes on 201, the card switches in place to
an **"activating" spinner** (📷), then to the **"You're set up — log out and back in once to activate
your self-service"** nudge. 📷
- Pass: the nudge appears **only after** the card polled `/api/auth/me` and matched the new
  `employeeId` (watch the Network tab: repeated `/api/auth/me` calls, then the nudge). Fail: the nudge
  shows immediately/before the poll matches.
- Timeout variant (optional, if the link is slow): after ~8s of polling with no match, the card shows
  the neutral **"still activating, check back shortly"** state — **not an error**. 📷

**4 — Card gone without reload.**
After the nudge, **without reloading**, confirm the setup CTA/card no longer offers the action (it is in
its done/nudge state, not the idle "Set me up" state). Then hard-reload the dashboard while still logged
in: `/api/auth/me` now returns `employeeId`, so the card is **absent entirely**. 📷

**5 — Re-login → `/my/*` resolves.**
Log out, log back in. Navigate to `/{workspace}/my/profile`. It resolves and shows the admin's own
record (their name/email). 📷
- Pass: page loads with own data, no 403/empty-employee state. Fail: 403, or "no employee" placeholder.

**6 — Scope check (KNOWN FINDING — confirm, do not fix).**
As the linked admin, open each and inspect what data is shown:
- `/my/profile` → **own** record only (expected ✅). 📷
- `/my/attendance` → **own** attendance only (expected ✅). 📷
- `/my/leave` → **EXPECTED TO LEAK.** The request list calls role-scoped `GET /api/v1/leave/requests`;
  a linked ADMIN has `ALL` scope, so this is expected to show **tenant-wide** leave requests, not just
  the admin's own. 📷 Confirm the leak.
- If `/my/leave` shows only own data, that is a *good* surprise — record it. If it shows tenant-wide
  data (expected), that is **FE-BACKLOG-022** confirmed. Either way this is a **finding, not a fix**;
  the nudge copy already avoids inviting admins to `/my/*`, so no user is walked into it. Escalate
  FE-BACKLOG-022 as the hard gate on the surface spec.

**7 — Employee list + headcount with a null-department record (FE-BACKLOG-023).**
As an admin, open the employees list and the dashboard headcount tile. Confirm both render correctly
with the new **null-department** self-setup record present — no crash, no broken row, department column
shows an empty/placeholder value gracefully, department filters still work. 📷
- Also note whether the new pending-activation record is counted in the headcount tile. If headcount
  counts it but payroll excludes it (PAYROLL-BACKLOG-005), record the headcount-vs-payroll mismatch.
- Record all of this in **FE-BACKLOG-023**.

## Reporting

Attach the screenshots and record, per step: pass/fail, and for steps 6–7 the specific data observed.
File anything unexpected. Confirmed findings update FE-BACKLOG-022 (scope leak) and FE-BACKLOG-023
(null department / headcount).
