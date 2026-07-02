# B-5 follow-ups — D1 recommendation & D4 spec

Companion to `2026-07-02-b5-grant-intent-matrix.md`. D2/D3/D5/D6 shipped in PR #34. This covers the two remaining items: **D1** (a decision, with recommendation) and **D4** (a feature, specced for build).

---

## D1 — Should HR_OFFICER approve/reject leave?  → **Recommendation: GRANT** (medium confidence)

### Current state (verified)
- `approve` / `reject` leave → `hasAnyRole('HR_MANAGER','ADMIN','LINE_MANAGER')`. HR_OFFICER can read all leave but not approve/reject.
- **HR_OFFICER is not a read-only role.** It already holds `PUT /employees/{id}` (edit employee records), sees the analytics dashboard + reports (D2), attendance, documents, and all leave. What it is *excluded* from today: leave approval, payroll-run approval, and bulk employee create/activate.

### The actual decision line
It is **not** "read vs write" (HR_OFFICER already writes employee data). The real line is **HR administration vs. approval authority**: today only manager-tier roles (HR_MANAGER/ADMIN tenant-wide, LINE_MANAGER for their dept) hold approval authority.

### Why I recommend granting
1. **Target market.** AndikishaHR targets Kenyan/EA SMEs, where the "HR office" is frequently one or two people. A tenant with an HR_OFFICER but **no HR_MANAGER** currently has *no HR-level leave approver at all* — only ADMIN or each LINE_MANAGER. That's a real operational gap, not a hypothetical.
2. **HR_OFFICER already mutates HR data** (employee records). Approving leave is a smaller authority than editing the employee master data they can already change.
3. **The main abuse is already blocked.** `approve()` prohibits self-approval (`SELF_APPROVAL_PROHIBITED`). Leave is not money movement; the blast radius is bounded.
4. **Trivially reversible** — a one-line `@PreAuthorize` change either way, now covered by tests.

### The one reason to decline
A **strict separation-of-duties policy** where approval authority is reserved to "manager"-titled roles by principle. If that's the org stance, keep HR_OFFICER read-only. (This is the only scenario where "no" is right — and it's a policy stance, not a technical risk.)

### If granted — scope
Grant HR_OFFICER **tenant-wide** approve/reject (same scope as HR_MANAGER — HR_OFFICER is not department-bound). Keep the self-approval guard. Implementation is adding `HR_OFFICER` to the two `@PreAuthorize` lines + an authz test (allowed HR_OFFICER, denied EMPLOYEE), mirroring PR #34.

**Decision:** _______ (recommend GRANT)

> Note: this reverses the initial matrix-doc lean ("keep read-only"), because that draft predated confirming HR_OFFICER already has employee-write authority. Surfacing the change rather than burying it.

---

## D4 — Employee/LINE_MANAGER payslip PDF self-service  → **Spec (feature, ~M)**

### Goal
Let an employee download **their own** payslip PDF, without opening an IDOR. Today `document-service` is class-level `ADMIN/HR_MANAGER/HR_OFFICER` only, so employees can't reach their own payslip PDF.

### Verified groundwork (this is why it's contained, not a new model)
- **Payslip PDFs are generated in document-service** (`PayslipGenerator`, `PayslipHtmlBuilder`, off `PayrollEventListener`) and stored as `Document`.
- **`Document` already carries the owner:** `Document.employeeId` (+ `employeeName`, `documentType`). No schema change needed to know who owns a doc.
- **The ownership-enforcement pattern already exists twice** and should be copied verbatim in shape:
  - `PayrollService.enforcePayslipOwnership(targetEmployeeId, authentication)` — payslip *data* (JSON) is already self-service (`GET /payroll/employees/{id}/payslips` includes EMPLOYEE + ownership check).
  - `AttendanceService.enforceAttendanceOwnership(...)` — same shape (privileged set → return; else compare `authentication.getCredentials()` = X-Employee-ID to the target).
- Employees **already see payslip data** on `my/payslips` (via payroll-service). D4 only adds the **PDF download**.

### Design decisions (resolve before build)
1. **Which document types are self-serviceable?** HR may store sensitive docs against an employee (e.g. disciplinary). Self-service must be an **allowlist**, not "any own document." Recommend: `PAYSLIP`, `P9_FORM` (and `CONTRACT` if desired). Confirm the enum values in `DocumentType`.
2. **LINE_MANAGER scope for payslips = OWN, not DEPARTMENT.** Payslips are private comp; a line manager should download *their own* payslip (as an employee), **not** their team's. So EMPLOYEE and LINE_MANAGER both get OWN scope here (unlike leave, where LINE_MANAGER gets DEPARTMENT). Confirm.
3. **Endpoint shape:** keep the existing `GET /documents/{id}/download` and add an ownership guard (by-id + guard, the B-3 pattern), rather than a new `/documents/me/...` surface. Simpler and consistent.

### Implementation plan (document-service)
1. **Move the class-level `@PreAuthorize` off the blanket ADMIN/HR set** and put per-method grants. On `download` (and `getById`, `forEmployee`): `@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER','HR_OFFICER','LINE_MANAGER','EMPLOYEE')")`. Leave `listAll`, `byType`, `forPayrollRun` at admin-tier (tenant-wide listing is not self-service).
2. **`DocumentService.download(id, authentication)`** — resolve the `Document`, then:
   - privileged (ADMIN/HR_MANAGER/HR_OFFICER) → allowed;
   - else require `document.getEmployeeId().toString().equals(callerEmployeeId)` (X-Employee-ID via `authentication.getCredentials()`), **and** `document.getDocumentType()` ∈ self-service allowlist; else `AccessDeniedException` (403).
   Copy `enforcePayslipOwnership` in shape; add a `documentType` allowlist check.
3. **Controller** passes `Authentication` into `download` (as payroll/attendance controllers do).
4. **Gateway:** confirm the `/api/v1/documents/**` route doesn't role-gate at the edge in a way that blocks EMPLOYEE (the #16 sweep set edge routes; verify document routes allow the new roles through to the service).
5. **Frontend (follow-on):** add a "Download PDF" action on `my/payslips` pointing at `GET /documents/{id}/download` (needs the document id per payslip — may require the payslip data to expose its generated `documentId`, or a lookup by employeeId+period).

### Tests (mirror B-3 / PR #34)
- EMPLOYEE downloads **own** payslip → 200.
- EMPLOYEE downloads **another** employee's document by id → 403 (IDOR closed).
- EMPLOYEE downloads own **non-allowlisted** type (e.g. disciplinary) → 403.
- LINE_MANAGER downloads a **team member's** payslip → 403 (OWN scope, not DEPARTMENT).
- ADMIN/HR_MANAGER downloads any → 200 (unchanged).

### Effort / sequencing
**M** — one service (document-service) + a gateway-route check + tests; the frontend button is a small follow-on. Bigger than the D2/D3/D5/D6 one-liners because of the ownership guard + type allowlist + the frontend wiring, but the ownership pattern is copy-from-existing, so low risk.

**Decision needed to start:** the type allowlist (design decision #1) and confirming LINE_MANAGER=OWN (#2).
