# Audit Log Masking Defect — One-Row Correction

**Date:** 2026-05-31
**Table:** `andikisha_employee.employee_history`
**Type:** Masking-bug-fix — defect now resolved
**Executed by:** Lawrence Chege

---

## Background

During Step 5 behavioral verification, the `maskAccount()` helper in `EmployeeService.update()` was found to mask incorrectly. The original code prepended `"****"` to the full account number string rather than showing only the last 4 digits:

```java
// Buggy (before fix)
"****" + employee.getBankAccountNumber()  // → "****1234567890"

// Fixed
maskAccount(employee.getBankAccountNumber())  // → "****7890"
```

The defect was introduced and immediately fixed in the same session (2026-05-31). Only one database row was written with the incorrect value before the fix was deployed.

---

## Corrected Row

| Field | Value |
|-------|-------|
| **Row ID** | `a2a4a314-0074-47fc-934b-efc9c4051691` |
| **Table** | `employee_history` |
| **employee_id** | `e6dc1450-e34e-4a3d-bfd0-3eeaa559f0ff` (Alice Kamau, EMP-0005) |
| **field_name** | `bankAccountNumber` |
| **old_value** | *(null — no account was previously set)* |
| **new_value (before fix)** | `****1234567890` |
| **new_value (after fix)** | `****7890` |
| **changed_at** | `2026-05-31 03:00:09.485` |
| **changed_by** | `b8a2f8c6-5be7-41ac-8140-092da241d0d0` (chegzlaw@gmail.com, HR_MANAGER) |

---

## SQL Executed

```sql
UPDATE employee_history
SET new_value = '****7890', updated_at = NOW()
WHERE id = 'a2a4a314-0074-47fc-934b-efc9c4051691';
```

**Result:** `UPDATE 1`

---

## Scope

This is a single-row correction of a log display value. The underlying account number `1234567890` was correctly stored in the `employees` table — only the audit log representation was wrong. The correction changes the logged string to match what the fixed code now produces for the same input.

No production data integrity is affected. No other rows contain the buggy masking pattern (confirmed by `SELECT COUNT(*) FROM employee_history WHERE new_value LIKE '****%' AND LENGTH(new_value) > 8` = 0 after fix).

---

## Root Cause and Fix

The code defect was caught by behavioral verification (Step 5 item 3) before any production deployment. The `maskAccount()` helper was added to `EmployeeService.java` as a private static method:

```java
private static String maskAccount(String acct) {
    if (acct == null || acct.isBlank()) return null;
    return "****" + (acct.length() > 4 ? acct.substring(acct.length() - 4) : acct);
}
```

All subsequent writes use the helper. Behavioral verification confirmed subsequent audit rows correctly show `****7890 → ****3210`.
