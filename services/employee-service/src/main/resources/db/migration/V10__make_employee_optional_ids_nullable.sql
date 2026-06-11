-- EMP-BACKLOG-002: make optional employee ID/statutory columns nullable.
--
-- Bulk imports of incomplete rosters (the pending-activation workflow) previously
-- stored colliding placeholders for absent optional fields — a shared
-- "+254700000000" phone, "PENDING-<empNum>" national IDs, and "" statutory
-- numbers — which tripped the (tenant_id, phone_number) / (tenant_id, national_id)
-- unique indexes on the second incomplete row (HTTP 409 DUPLICATE), and an empty
-- kra_pin hit a NOT NULL violation.
--
-- These five fields are genuinely optional at import time (collected later at
-- activation). Storing NULL is correct: the existing UNIQUE indexes on
-- (tenant_id, national_id) and (tenant_id, phone_number) already permit multiple
-- NULLs (PostgreSQL treats NULLs as distinct), and kra_pin's unique index is
-- already partial (WHERE kra_pin IS NOT NULL).
--
-- Single-employee creation still requires all five (CreateEmployeeRequest @NotBlank),
-- so only pending-activation bulk records will carry NULLs.
--
-- DROP NOT NULL is a catalog-only change (no table rewrite); the brief
-- ACCESS EXCLUSIVE lock is negligible at tenant scale.

ALTER TABLE employees ALTER COLUMN national_id  DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN kra_pin      DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN nhif_number  DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN nssf_number  DROP NOT NULL;
