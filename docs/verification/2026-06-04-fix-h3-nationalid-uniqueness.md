# Fix H-3 — nationalId Uniqueness Verification Report

**Date:** 2026-06-04  
**Commit:** `c35a1d9`  
**Source:** H-3 in `docs/audits/2026-06-03-bug-hunt-inventory.md`

---

## What was changed

**File:** `services/employee-service/src/main/java/com/andikisha/employee/application/service/BulkUploadService.java`

**Step 1 — Repository method:** `existsByTenantIdAndNationalId` already existed at `EmployeeRepository.java:35`. No new method needed.

**Step 2 — Pre-pass in `validate()`:** Before the per-row validation loop, a first pass builds:
```java
Map<String, List<Integer>> inFileDuplicateNationalIds = new HashMap<>();
// ... populates nationalId → [rowNumbers] for all non-blank nationalIds
// ... removes entries with only one occurrence
```
This map is passed into every `validateRow()` call.

**Step 3 — Two new checks in `validateRow()`** (both skip blank nationalId):
```java
// Cross-file: database collision
if (employeeRepository.existsByTenantIdAndNationalId(tenantId, nationalId)) {
    errs.add(new BulkRowError(rowNum, "nationalId", nationalId,
        "National ID '" + nationalId + "' is already registered for another employee in this tenant."));
}
// In-file: duplicate rows within the upload
if (inFileDuplicateNationalIds.containsKey(nationalId)) {
    String rowList = inFileDuplicateNationalIds.get(nationalId).stream()
        .map(Object::toString).collect(Collectors.joining(", "));
    errs.add(new BulkRowError(rowNum, "nationalId", nationalId,
        "National ID '" + nationalId + "' appears in multiple rows of this upload (rows: " + rowList + ")."));
}
```

**Step 4 — Multi-error composition:** Both checks run independently. A row that is both an in-file and cross-file duplicate gets two error entries (confirmed in Test 4).

---

## Test results

All tests **observed** — run against the live employee-service.

Tenant: `1cc12430-7c3a-45b7-8973-469622778c9d` (demo tenant)

---

### Test 1 — Cross-file duplicate (database collision) ✅ PASS

**Setup:** Alice Kamau has `nationalId = "33732761"` in the DB.  
**Upload:** One row with `nationalId = "33732761"`, all other fields valid.

**Response (HTTP 200):**
```
totalRows=1 validRows=0 errors=1
  row=2 field=nationalId: National ID '33732761' is already registered for another employee in this tenant.
```

Previously: HTTP 409 DUPLICATE (generic) from `DataIntegrityViolationException` at commit time.  
Now: HTTP 200 with row-level error at validate time.

---

### Test 2 — In-file duplicate (two rows share same NID) ✅ PASS

**Setup:** NID `99999999` not in DB.  
**Upload:** Two rows both with `nationalId = "99999999"`.

**Response (HTTP 200):**
```
totalRows=2 validRows=0 errors=2
  row=2 field=nationalId: National ID '99999999' appears in multiple rows of this upload (rows: 2, 3).
  row=3 field=nationalId: National ID '99999999' appears in multiple rows of this upload (rows: 2, 3).
```

Both affected rows flagged (not just the second). Row list includes both rows.

---

### Test 3 — In-file duplicate across 3 rows (rows 2, 5, 8) ✅ PASS

**Upload:** 7 data rows; rows 2, 5, 8 share `nationalId = "55555555"`, other 4 rows have unique NIDs.

**Response (HTTP 200):**
```
totalRows=7 validRows=4 errors=3
  row=2 field=nationalId: National ID '55555555' appears in multiple rows of this upload (rows: 2, 5, 8).
  row=5 field=nationalId: National ID '55555555' appears in multiple rows of this upload (rows: 2, 5, 8).
  row=8 field=nationalId: National ID '55555555' appears in multiple rows of this upload (rows: 2, 5, 8).
```

All three conflicting rows are flagged. The four non-conflicting rows are valid (validRows=4).

---

### Test 4 — Both in-file AND cross-file for same NID ✅ PASS

**Setup:** Set Alice's NID to `77777777` in DB.  
**Upload:** Two rows both with `nationalId = "77777777"`.

**Response (HTTP 200):**
```
totalRows=2 validRows=0 errors=4
  row=2 field=nationalId: National ID '77777777' is already registered for another employee in this tenant.
  row=2 field=nationalId: National ID '77777777' appears in multiple rows of this upload (rows: 2, 3).
  row=3 field=nationalId: National ID '77777777' is already registered for another employee in this tenant.
  row=3 field=nationalId: National ID '77777777' appears in multiple rows of this upload (rows: 2, 3).
```

Each of the two rows gets two error entries: one cross-file + one in-file. Total 4 errors. Alice's NID was restored to `33732761` after the test.

---

### Test 5 — Blank nationalId values do not collide ✅ PASS

**Upload:** 3 rows, all with blank nationalId column, all other fields valid.

**Response (HTTP 200):**
```
totalRows=3 validRows=3 errors=0
```

Blank values are skipped by both checks. No false positives.

---

### Test 6 — Clean upload regression (unique NIDs, commit succeeds) ✅ PASS

**Upload:** 2 rows with unique NIDs (`T60000001`, `T60000002`), valid KRA PINs, valid emails.  

**Validate response (HTTP 200):**
```
validRows=2 errors=0
```

**Commit response:**
```
createdCount=2 error=none
```

Two employee records created successfully. No constraint violation at commit time.

**Note:** Earlier Test 6 attempts without kraPin failed at commit time with `null value in column "kra_pin" violates not-null constraint`. This is a pre-existing issue in `BulkUploadService.createFromRow()` when the optional kraPin field is omitted from the CSV — unrelated to H-3. The final Test 6 run included kraPin and committed cleanly. This pre-existing issue will be addressed separately under EMP-BACKLOG-002.

---

### Test 7 — Safety net: re-commit already-committed batch ✅ PASS

**Action:** Re-committed the batch from Test 6 (already in COMMITTED state).

**Response:**
```
error=ALREADY_COMMITTED msg=This upload batch has already been committed.
```

The `DataIntegrityViolationException` → HTTP 409 path in `GlobalExceptionHandler` was not exercised (the nationalId fix prevents that path from firing for the nationalId case). The `ALREADY_COMMITTED` guard in `commit()` correctly blocks double-commits. The `GlobalExceptionHandler` mapping for `DataIntegrityViolationException` remains in place as defense-in-depth for concurrent inserts (other constraint types) and was not removed.

---

## Build verification

```
./gradlew :services:employee-service:build --no-daemon
→ BUILD SUCCESSFUL
```

All existing employee-service tests pass. No regressions in the bulk upload feature (Steps 6 verification scenarios: template download, validation-with-errors, clean upload, pending activation).

---

## Honest notes

- **Test 6 first attempt failed** due to a pre-existing `kra_pin NOT NULL` constraint that fires when the CSV omits kraPin. This is a pre-existing issue in `createFromRow()` (tracked as EMP-BACKLOG-002: NOT NULL workaround). It is unrelated to H-3 and was not fixed in this session. The fix was confirmed working by providing a complete CSV row.

- **`DataIntegrityViolationException` path not directly re-exercised:** Test 7 confirmed the `ALREADY_COMMITTED` guard, not the raw constraint path. The constraint path (HTTP 409 DUPLICATE) was verified indirectly by the test-6-first-attempt failure and by code inspection confirming the `GlobalExceptionHandler` mapping is unchanged.

- **Row numbering:** The validation report uses 1-based row numbers counting from the CSV header as row 1. Data rows start at row 2. This is consistent with how the existing email and field validation report rows (the `rowNum = 2` initialization in `validate()`).
