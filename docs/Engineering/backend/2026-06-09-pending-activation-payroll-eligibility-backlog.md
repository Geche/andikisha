# BACKLOG — pending-activation employees are payroll/filing-eligible despite incomplete statutory IDs

**Severity:** Medium — compliance/payment correctness. Not introduced by W5 (pre-existing);
surfaced while confirming the EMP-BACKLOG-002 fix didn't leak placeholders into filings.
**Date:** 2026-06-09 · **Surfaced by:** UX-flow-remediation-01, W5 follow-up.
**Component:** employee-service (`EmployeeQueryService.findAllActive`), payroll-service,
integration-hub-service (statutory filings + M-Pesa).

## Context (what's NOT a problem)
After W5, bulk imports store **NULL** — not the old colliding placeholders — for absent
optional fields. Verified in the live DB: **0** `national_id LIKE 'PENDING-%'`, **0**
`phone_number = '+254700000000'`. So the specific bug originally feared — a `"PENDING-"`
KRA PIN or a fake `+254700000000` phone flowing into a statutory file or an M-Pesa
disbursement — **cannot occur**; those values no longer exist or get created. (One cosmetic
remnant: 4 rows with empty-string `nhif_number`; an optional `''→NULL` cleanup migration
could tidy these, not required for correctness.)

## The actual gap
`EmployeeQueryService.findAllActive()` — the source for payroll and statutory filings via
gRPC `ListActiveByTenant` — includes **ON_PROBATION**. Bulk pending-activation employees
are created `ON_PROBATION` with `pending_activation = true`, and that flag is **not used as
an exclusion guard**. So an incomplete, not-yet-activated employee **with a salary** (the
bulk template requires `basicSalary`) is payroll/filing-eligible.

Consequences when such an employee is in a run:
- Deduction **amounts** are correct (PAYE/SHIF/NSSF/Housing are computed from gross, not
  from the ID numbers) — so no miscalculation.
- But the statutory **filing** carries **blank** member identifiers (NULL KRA PIN / SHIF /
  NSSF number) — an incomplete return the authority may reject.
- M-Pesa disbursement has **no phone** (NULL) — it fails/errors rather than mis-paying
  (strictly safer than the old fake-phone behaviour, but still a failed payment row).

## Recommended fix
Exclude pending-activation (or otherwise statutorily-incomplete) employees from payroll and
filing eligibility until activated. Options:
1. `findAllActive()` (and/or the payroll/filing selection) excludes
   `pending_activation = true`.
2. Or a completeness predicate (KRA PIN + SHIF + NSSF + phone present) gates inclusion, with
   a pre-run "N employees skipped — incomplete statutory details" warning (payroll already
   emits similar skip warnings for missing salary / zero pay).

Add tests: a pending-activation employee is excluded from `ListActiveByTenant` / the payroll
run, and re-included once activated with complete details.

## Scope note
Out of scope for W5 (which exposed bulk upload + fixed the placeholder collision). Changing
payroll eligibility is a behavioural change warranting its own review + verification.
