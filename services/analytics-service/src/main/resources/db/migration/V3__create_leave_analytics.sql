CREATE TABLE leave_analytics (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   VARCHAR(50) NOT NULL,
    period                      VARCHAR(7) NOT NULL,
    leave_type                  VARCHAR(20) NOT NULL,
    requests_submitted          INTEGER NOT NULL DEFAULT 0,
    requests_approved           INTEGER NOT NULL DEFAULT 0,
    requests_rejected           INTEGER NOT NULL DEFAULT 0,
    total_days_taken            NUMERIC(8,1) NOT NULL DEFAULT 0,
    unique_employees            INTEGER NOT NULL DEFAULT 0,
    average_days_per_request    NUMERIC(5,1) NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    version                     BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, period, leave_type)
);

CREATE INDEX idx_leave_analytics_tenant ON leave_analytics(tenant_id);
CREATE INDEX idx_leave_analytics_period ON leave_analytics(tenant_id, period);