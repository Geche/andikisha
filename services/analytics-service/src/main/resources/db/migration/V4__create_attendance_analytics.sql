CREATE TABLE attendance_analytics (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50) NOT NULL,
    period                  VARCHAR(7) NOT NULL,
    total_clock_ins         INTEGER NOT NULL DEFAULT 0,
    total_regular_hours     NUMERIC(10,2) DEFAULT 0,
    total_overtime_hours    NUMERIC(10,2) DEFAULT 0,
    average_hours_per_day   NUMERIC(5,2) DEFAULT 0,
    late_arrivals           INTEGER NOT NULL DEFAULT 0,
    absent_days             INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    version                 BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, period)
);

CREATE INDEX idx_attendance_analytics_tenant ON attendance_analytics(tenant_id);