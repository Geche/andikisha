CREATE TABLE work_schedules (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50) NOT NULL,
    name                    VARCHAR(100) NOT NULL,
    start_time              TIME NOT NULL,
    end_time                TIME NOT NULL,
    hours_per_day           NUMERIC(4,1) NOT NULL,
    working_days_per_week   INTEGER NOT NULL DEFAULT 5,
    late_threshold_minutes  INTEGER NOT NULL DEFAULT 15,
    is_default              BOOLEAN NOT NULL DEFAULT FALSE,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    version                 BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_work_schedules_tenant ON work_schedules(tenant_id);