# Design: leave day-counting basis — working days vs calendar days (LEAVE-BACKLOG-002)

**Status:** Accepted (2026-07-29) — recommended defaults approved. **Phase 1 (weekend exclusion)
implemented** in this change; Phase 2 (public holidays) remains deferred with the shared
`CalendarService`. Decisions on §4: Q1 defer holidays to Phase 2; Q2 SICK = working days;
Q3 whole-day only; Q4 prospective (no retroactive recompute — new day counts apply to requests
created after deploy; existing stored counts are untouched); Q5 `max_consecutive_days` matches the
type's basis.
**Date:** 2026-07-29
**Related:** [[LEAVE-BACKLOG-002]] (the finding), [[PAYROLL-BACKLOG-001]] (shipped the sibling
calendar-basis fix for the unpaid-leave *pay* deduction and defers the shared `public_holidays`/
`CalendarService` work).

## 1. Problem

Leave day counts are computed as **inclusive calendar days** and there is no weekend or public-holiday
handling anywhere in leave-service. `LeaveService`:

```java
BigDecimal days = ChronoUnit.DAYS.between(startDate, endDate) + 1;   // weekends included
```

The same server-computed value is authoritative (a client-supplied `days` that differs is logged and
ignored), and it drives balance deduction on approve (`balance.deduct(request.getDays())`) and
balance restore on cancel (`balance.restore(finalRequest.getDays())`).

But entitlements are statutory. `LeavePolicy.validateMinimumDays` enforces minimums *"per the Kenyan
Employment Act Cap 226"* — and under **s.28 of that Act, annual leave is 21 _working_ days**. So the
entitlement side means working days while the consumption side counts calendar days. The two are in
the same `days` unit but different bases, so any leave range that spans a weekend **over-charges the
balance**:

| Request | Working days off | Days deducted today | Over-charge |
|---|---|---|---|
| Fri → Mon | 2 | 4 | +2 |
| Mon → Fri of week 2 | 10 | 12 | +2 |
| Mon → Fri of week 3 | 15 | 19 | +4 |

An employee with the statutory 21-working-day entitlement effectively gets fewer usable days the more
their leave straddles weekends. This is a compliance-correctness bug on the most-used leave type.

## 2. Why this is not a one-line fix

The correct basis is **leave-type dependent**. A blanket switch to working days would *break* the
statutory block grants, which are correctly calendar-day today:

- **ANNUAL** — 21 **working** days (Act s.28). Currently wrong.
- **SICK** — the Act's sick leave (s.30: 7 days full + 7 half) is working-day based; this system grants
  a more generous 30. Basis needs confirmation (see §4).
- **MATERNITY** — s.29: 3 months / **90 calendar** days, one continuous block. Currently **correct**.
- **PATERNITY** — s.29: **14** days, conventionally **calendar**, continuous block. Currently **correct**.
- **COMPASSIONATE / STUDY** — policy-defined, not statutory. Basis is a policy choice.
- **UNPAID** — already calendar-counted, and PAYROLL-BACKLOG-001 just shipped the *pay* deduction on a
  **calendar** basis (monthly salary ÷ calendar-days-in-month × calendar unpaid days). These two must
  stay on the **same** basis or the pay math desyncs again — so UNPAID stays calendar.

## 3. Proposed decision

### 3.1 Basis per leave type (recommended)

| Type | Basis | Rationale |
|---|---|---|
| ANNUAL | **Working** (exclude Sat/Sun; holidays per §4-Q1) | Act s.28 — 21 working days |
| SICK | **Working** | s.30 sick leave is working-day based; pending §4-Q2 |
| COMPASSIONATE | **Working** | short discretionary; consistent with annual |
| STUDY | **Working** | policy; working-day consistent |
| MATERNITY | **Calendar** | s.29 — 90 calendar days, continuous block |
| PATERNITY | **Calendar** | s.29 — 14 days, continuous block |
| UNPAID | **Calendar** | keep in lockstep with the PAYROLL-BACKLOG-001 pay deduction |

Entitlements need no change: ANNUAL stays `daysPerYear = 21`, now correctly meaning 21 *working* days
once consumption is working-day counted. The monthly-accrual side (`ANNUAL.accruesMonthly()`, 21/12) is
already in the same unit — aligning consumption fixes the mismatch end to end.

### 3.2 Phasing (recommended)

- **Phase 1 — weekends only (no schema change).** A `LeaveDayCalculator` excludes Sat/Sun for
  working-day types. This removes the bulk of the over-charge with zero new infrastructure and is
  shippable independently.
- **Phase 2 — public holidays.** Add the `public_holidays` table + `CalendarService` deferred by
  PAYROLL-BACKLOG-001 (one calendar source for both leave and payroll) and exclude gazetted KE holidays
  that fall on working days. Smaller residual error; larger scope; do it when multi-period payroll lands.

## 4. Open questions requiring a decision

- **Q1 — Public holidays in Phase 1?** Recommend **no** — ship weekend exclusion now, holidays in
  Phase 2 with the shared table. (If Phase-1-must-include-holidays, it pulls the `public_holidays` table
  forward and this stops being a small change.)
- **Q2 — SICK basis.** Working or calendar? The Act implies working days; confirm against how the
  30-day grant is administered in practice.
- **Q3 — Half-day leave.** The `days` field is `BigDecimal` (fraction-capable) but the counter only
  ever produces whole numbers. Is half-day a requirement? Recommend **whole-day only** for now; revisit
  separately.
- **Q4 — Historical approved requests.** Recompute existing balances to the new basis, or apply
  prospectively? Recommend **prospective from a cutover date** — retroactive recompute rewrites audited
  balances and reopens closed leave years. Requests straddling the cutover use the basis in force at
  approval time.
- **Q5 — `max_consecutive_days` validation.** Should the cap count working or calendar days? Recommend
  it **matches the type's basis** (working-day cap for annual) so the limit means what an approver reads.

## 5. Implementation sketch (Phase 1)

- Add `LeaveType.countsWorkingDays()` (or a `LeaveBasis` enum) encoding the §3.1 matrix.
- Introduce a domain `LeaveDayCalculator.countDays(LeaveType, LocalDate start, LocalDate end,
  Set<LocalDate> holidays)` → `BigDecimal`. Phase 1 passes an empty holiday set; weekend exclusion is
  a `DayOfWeek` filter over the inclusive range.
- Replace the inline `ChronoUnit.DAYS.between(...) + 1` at `LeaveService` with the calculator. Deduct
  and restore already consume the stored `days`, so they become correct automatically (restore reads the
  same stored value it deducted — no drift).
- Apply the same calculator to `max_consecutive_days` validation (per Q5).
- UI copy: label working-day types as "working days" so the count an employee sees is unambiguous.

No schema change in Phase 1. `sumApprovedUnpaidDaysByPeriod` (UNPAID, calendar) is unaffected.

## 6. Testing

- Per-type day counting: ANNUAL Fri→Mon = 2; MATERNITY Fri→Mon = 4 (block grant unchanged).
- Weekend-spanning ranges, single-day requests, ranges starting/ending on a weekend.
- Deduct-then-restore round-trips to the same balance (cancel returns exactly what approve took).
- Cutover-date boundary once Q4 is settled.

## 7. Consequences and risks

- **Balances employees see will change** for working-day types — needs a release note; some employees
  effectively regain days. This is a correction, not a giveaway, but it must be communicated.
- **Cross-service consistency:** attendance and payroll must not separately re-derive leave day counts;
  leave-service stays the single source. UNPAID's calendar basis is deliberately pinned to the
  PAYROLL-BACKLOG-001 pay deduction — changing one requires changing the other.
- **Phase 2 dependency:** full statutory correctness (holiday exclusion) is gated on the
  `public_holidays`/`CalendarService` work shared with PAYROLL-BACKLOG-001.
