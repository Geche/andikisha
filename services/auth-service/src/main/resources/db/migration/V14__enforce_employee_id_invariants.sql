-- V14: Enforce user-to-employee link invariants going forward.
--
-- Two rules enforced from this migration forward:
--   1. SUPER_ADMIN users must never have an employee_id.
--   2. Non-SUPER_ADMIN, non-ADMIN users must always have an employee_id.
--
-- NOT VALID skips validation of existing rows (legacy data is not broken by this).
-- New INSERTs and UPDATEs ARE enforced immediately.
--
-- ADMIN is excluded from constraint 2 because tenant admins are provisioned before
-- their employee record exists in employee-service. The EmployeeCreatedListener
-- back-fills the link once the admin creates their employee record.

ALTER TABLE users
    ADD CONSTRAINT chk_superadmin_no_employee_id
    CHECK (role != 'SUPER_ADMIN' OR employee_id IS NULL)
    NOT VALID;

ALTER TABLE users
    ADD CONSTRAINT chk_operational_role_requires_employee_id
    CHECK (role IN ('SUPER_ADMIN', 'ADMIN') OR employee_id IS NOT NULL)
    NOT VALID;
