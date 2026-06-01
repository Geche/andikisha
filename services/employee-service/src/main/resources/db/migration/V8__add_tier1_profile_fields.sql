-- V8: Add tier-1 self-service profile fields.
-- These fields are editable by the employee themselves (no HR required).
-- Tier-2 fields (bank, statutory, name, DOB, national_id) remain HR-edit-only.

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS personal_email        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS emergency_contact_name  VARCHAR(200),
    ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS avatar_url            VARCHAR(500);
