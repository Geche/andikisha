-- Race-free employee number generation using an atomic upsert counter per tenant
CREATE TABLE employee_number_sequences (
    tenant_id   VARCHAR(50) PRIMARY KEY,
    last_number INTEGER     NOT NULL DEFAULT 0
);

-- Align employee_history with BaseEntity (adds updated_at and version columns)
ALTER TABLE employee_history
    ADD COLUMN updated_at TIMESTAMP;

UPDATE employee_history
SET updated_at = changed_at;

ALTER TABLE employee_history
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE employee_history
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
