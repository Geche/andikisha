# Create Employee Form Audit
**Date:** 2026-05-15  
**Scope:** `frontend/tenant-portal/src/app/(admin)/admin/employees/` — list, detail, new pages  
**Method:** Cross-reference every field reference in `.tsx` files against `EmployeeSummaryResponse`, `EmployeeDetailResponse`, `CreateEmployeeRequest`, `UpdateEmployeeRequest` in employee-service  

---

## 1. List Page Browser Verifications

**Pagination** — Seeded 22 employees (total now 26). API with `size=25`:
- Page 0: `total=26 totalPages=2 countOnPage=25 first=true last=false` ✅
- Page 1: `total=26 totalPages=2 countOnPage=1 first=false last=true` ✅
- Pagination controls render correctly; page navigation preserved filter+sort params in the URL query (tested `status=ON_PROBATION&sort=firstName,asc`).

**Empty state** — `search=zzz_no_match_ever`:
- API returns `total=0 content_len=0 empty=true` ✅
- Frontend renders `No employees found` row (in `<tbody>`) not a blank table ✅
- Empty state is isolated inside the table skeleton branch — no conflation with loading state.

**Loading state** — code review (network simulation requires browser DevTools):
- `isLoading ? <TableSkeleton /> : <table>...</table>` — the skeleton is the ternary branch, not conditional inside the table. While `isLoading=true`, the 8-row skeleton renders. The "No employees found" row is inside the table branch and can only render when `isLoading=false`. No conflation bug present in the code. ✅

---

## 2. Field-Name Mismatch Sweep

### 2a. List page — `emp.*` references

Fixed in commit 44fe74d. All `emp.*` references now match `EmployeeSummaryResponse`. ✅

### 2b. Detail page — `employee.*` references

Backend shape: `EmployeeDetailResponse` (see record below)

| Frontend field | Backend field | Status | Impact |
|---|---|---|---|
| `employee.department` | `departmentName` | **MISMATCH** | Always renders "—" |
| `employee.jobTitle` | `positionTitle` | **MISMATCH** | Always renders "—"; subtitle uses `employee.jobTitle` — shows blank |
| `employee.bankAccount` | `bankAccountNumber` | **MISMATCH** | Always renders "—" |
| `employee.mpesaNumber` | *(not in response)* | **PHANTOM FIELD** | Backend doesn't store M-Pesa in `EmployeeDetailResponse`; always renders "—" |
| `employee.shifNumber` | `nhifNumber` | **MISMATCH** | Always renders "—"; field is named `nhifNumber` in backend (SHIF replaced NHIF Oct 2024, transitional naming) |
| `employee.terminatedAt` | `terminationDate` | **MISMATCH** | Termination date never shows in the banner |
| `employee.terminationReason` | *(not in response)* | **PHANTOM FIELD** | Backend doesn't expose reason in `EmployeeDetailResponse` |
| `employee.status === "TERMINATED"` | `"TERMINATED"` | ✅ | Correct |
| `employee.status === "PROBATION"` | `"ON_PROBATION"` | **MISMATCH** | `statusBadgeClass`/`statusLabel` never match |
| `employee.basicSalary` | `basicSalary` (BigDecimal → number) | ✅ | Correct |
| `employee.currency` | `currency` | ✅ | Correct |
| `employee.bankName` | `bankName` | ✅ | Correct |
| `employee.email`, `employee.nationalId`, `employee.kraPin`, `employee.phoneNumber`, `employee.hireDate`, `employee.nssfNumber`, `employee.employmentType`, `employee.employeeNumber` | All match | ✅ | Correct |

**Fields in `EmployeeDetailResponse` not surfaced by the detail page** (no current display is not a bug, documenting for future):
- `dateOfBirth`, `gender`, `departmentId`, `positionId`, `housingAllowance`, `transportAllowance`, `medicalAllowance`, `otherAllowances`, `grossPay`, `probationEndDate`, `bankBranch`, `createdAt`

### 2c. New employee page — `CreateEmployeeRequest` interface vs backend

Backend record `CreateEmployeeRequest`:
```
firstName (@NotBlank, max 100)          — required
lastName (@NotBlank, max 100)           — required
nationalId (@NotBlank, pattern ^\d{6,10}$)  — required
phoneNumber (@NotBlank, pattern ^(\+254|0)7\d{8}$)  — required
email (@Email, no @NotBlank)            — optional
kraPin (@NotBlank, pattern ^[A-Z]\d{9}[A-Z]$)  — required
nhifNumber (@NotBlank)                  — required
nssfNumber (@NotBlank)                  — required
employmentType (@NotNull String)        — required
basicSalary (@NotNull BigDecimal, @Positive)  — required
housingAllowance (BigDecimal)           — optional
transportAllowance (BigDecimal)         — optional
medicalAllowance (BigDecimal)           — optional
otherAllowances (BigDecimal)            — optional
currency (String)                       — optional
departmentId (UUID)                     — optional
positionId (UUID)                       — optional
hireDate (LocalDate)                    — optional
dateOfBirth (LocalDate)                 — optional
gender (String)                         — optional
```

| Issue | Severity | Details |
|---|---|---|
| Form sends `shifNumber`; backend requires `nhifNumber` | **BLOCKING** | `nhifNumber` is `@NotBlank`. Every create attempt returns HTTP 400 "NHIF number is required". The form labels this field "SHIF Number" and stores it as `shifNumber` — the wrong JSON key. |
| Form sends `department` (free text); backend requires `departmentId` (UUID) | **Data loss** | Field silently dropped by Jackson — department never saved. Same for `jobTitle` vs `positionId`. |
| Form sends `bankName`, `bankAccount`, `mpesaNumber`; none exist in `CreateEmployeeRequest` | **Data loss** | All three fields silently dropped. Bank/M-Pesa details are set via `UpdateEmployeeRequest` after creation (`bankName`, `bankAccountNumber`, `bankBranch`) — M-Pesa is not in the update DTO either. |
| "At least one payment method required" validation | **Wrong** | Client-side guard requires bank or M-Pesa input before submitting, but the backend ignores both. Blocks valid submissions with no effect. |
| Email marked `required` in UI but is optional in backend | **UX mismatch** | Backend `@Email` (no `@NotBlank`) means null email is valid. The asterisk + `required` attribute reject submissions with no email. |
| Redirect after creation: `/employees/${id}` | **Broken link** | Should be `/admin/employees/${id}`. Currently navigates to a 404. |
| `INTERN` employment type option | **Unknown risk** | Backend accepts `String employmentType` with no explicit allowed-values list visible from the request DTO. The service layer may or may not validate against an enum. Needs service-layer check before shipping. |

---

## 3. Statutory ID Validation Rules

| Field | Pattern | Example | Backend validates? | Form validates? |
|---|---|---|---|---|
| KRA PIN | `^[A-Z]\d{9}[A-Z]$` | `A123456789X` | ✅ `@Pattern` | ❌ Only `required` |
| National ID | `^\d{6,10}$` | `12345678` | ✅ `@Pattern` | ❌ Only `required` |
| Phone | `^(\+254|0)7\d{8}$` | `0712345678` or `+254712345678` | ✅ `@Pattern` | ❌ Only `required` |
| NHIF/SHIF number | none | Any non-blank string | `@NotBlank` only | ❌ |
| NSSF number | none | Any non-blank string | `@NotBlank` only | ❌ |

Client-side validation is absent for all three patterned fields. Users will fill out the form, submit, and receive backend 400 errors with raw Spring validation messages. These should be caught client-side with inline field errors before the request is sent.

---

## 4. Dependent Fields

| Field | Drives | Current state |
|---|---|---|
| `departmentId` | No cascade in backend | No departments seeded in demo; need `GET /api/v1/departments` to populate select |
| `positionId` | No cascade | No positions seeded; need `GET /api/v1/positions` to populate select |
| `employmentType` | Statutory deduction rules in payroll-service | No UI cascade needed on create — payroll handles it |
| `basicSalary` | Gross pay calculation | `grossPay` is computed server-side; form doesn't need to show it |

**Department selects:** `GET /api/v1/departments` exists in employee-service (`@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER','HR','EMPLOYEE')")`). Returns `List<DepartmentResponse>` with `id`, `name`, `description`, `parentId`, `employeeCount`, `active`. Zero departments are seeded in the demo tenant. The create form should use a select populated from this endpoint; empty-state gracefully shows "No departments — add one first."

**Position selects:** `Position` exists as a domain model and JPA entity but there is **no HTTP controller** exposing positions. `GET /api/v1/positions` does not exist. The `positionId` field on `CreateEmployeeRequest` can therefore only be populated with a UUID obtained out-of-band. For now, remove `positionTitle` from the create form until a positions API is added.

---

## 5. Fields the Backend Captures That the Form Doesn't Surface

| Backend field | Form | Decision |
|---|---|---|
| `housingAllowance` | Missing | Should be in Compensation section |
| `transportAllowance` | Missing | Should be in Compensation section |
| `medicalAllowance` | Missing | Should be in Compensation section |
| `otherAllowances` | Missing | Should be in Compensation section |
| `dateOfBirth` | Missing | Should be in Personal Information section |
| `gender` | Missing | Should be in Personal Information section |
| `hireDate` | Present ✅ | — |
| `currency` | Hardcoded KES | Correct for Kenya-only phase |

The four allowance fields are important for Kenya payroll: PAYE, SHIF, Housing Levy are all computed against gross pay which includes allowances. Omitting them means the first payroll run will compute wrong deductions unless the employee is updated first.

---

## 6. Fields the Form Captures That the Backend Doesn't

| Form field | Issue | Action |
|---|---|---|
| `bankAccount` (create form) | Not in `CreateEmployeeRequest` | Move to edit form only; use `UpdateEmployeeRequest.bankAccountNumber` |
| `bankName` (create form) | Not in `CreateEmployeeRequest` | Move to edit form only |
| `mpesaNumber` (create/detail) | Not in any DTO | Backend doesn't model M-Pesa separately from bank; the payroll disbursement channel is set in `integration-hub-service`, not `employee-service`. Remove from create/detail. |
| "At least one payment method" guard | Redundant given above | Remove |

---

## 7. Summary: What Blocks a Working Create Flow

In priority order:

1. **`nhifNumber` field name** — blocking. Form sends `shifNumber`, backend requires `nhifNumber`. Nothing can be created.
2. **`bankAccount`/`mpesaNumber` not in DTO** — misleads the user. Remove from create form.
3. **Department/Position are UUID lookups, not free text** — data silently dropped. Need API lookup endpoints or remove until available.
4. **Missing allowance fields** — payroll will compute wrong statutory deductions without them.
5. **Client-side validation missing** for KRA PIN, phone, national ID — reduces UX quality.
6. **Email incorrectly required** in form — blocks creation for employees without work email.
7. **Post-create redirect broken** — `/employees/${id}` → `/admin/employees/${id}`.
8. **INTERN employment type** — needs service-layer validation check before exposing in UI.

---

## 8. What's Already Good

- Form layout (sections, Field component, inputCls) — clean, reusable pattern.
- `mutation` wired to `invalidateQueries` on success — correct cache bust.
- `isPending` disables all inputs and submit button correctly.
- `basicSalary` sends as `number` (flat BigDecimal) — matches backend after this was confirmed via seeding test.
- `nssfNumber` field name is correct — only NHIF is wrong.
- Navigation back to list (`/admin/employees`) is correct.
- `currency` hardcoded to "KES" in the body — correct for current phase.
