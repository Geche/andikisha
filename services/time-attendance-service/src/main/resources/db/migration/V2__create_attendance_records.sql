CREATE TABLE attendance_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           VARCHAR(50) NOT NULL,
    employee_id         UUID NOT NULL,
    attendance_date     DATE NOT NULL,
    clock_in            TIMESTAMP,
    clock_out           TIMESTAMP,
    clock_in_source     VARCHAR(20),
    clock_out_source    VARCHAR(20),
    clock_in_latitude   DOUBLE PRECISION,
    clock_in_longitude  DOUBLE PRECISION,
    clock_out_latitude  DOUBLE PRECISION,
    clock_out_longitude DOUBLE PRECISION,
    hours_worked        NUMERIC(5,2),
    regular_hours       NUMERIC(5,2),
    overtime_hours      NUMERIC(5,2),
    is_late             BOOLEAN NOT NULL DEFAULT FALSE,
    late_minutes        INTEGER,
    is_early_departure  BOOLEAN NOT NULL DEFAULT FALSE,
    is_absent           BOOLEAN NOT NULL DEFAULT FALSE,
    is_on_leave         BOOLEAN NOT NULL DEFAULT FALSE,
    is_holiday          BOOLEAN NOT NULL DEFAULT FALSE,
    notes               VARCHAR(500),
    approved_by         UUID,
    is_approved         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_attendance_tenant ON attendance_records(tenant_id);
CREATE INDEX idx_attendance_employee ON attendance_records(tenant_id, employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(tenant_id, attendance_date);
CREATE INDEX idx_attendance_employee_date ON attendance_records(tenant_id, employee_id, attendance_date);