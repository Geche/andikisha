CREATE TABLE leave_policies (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             VARCHAR(50)   NOT NULL,
    leave_type            VARCHAR(20)   NOT NULL,
    days_per_year         INTEGER       NOT NULL,
    carry_over_max        INTEGER       NOT NULL DEFAULT 0,
    requires_approval     BOOLEAN       NOT NULL DEFAULT TRUE,
    requires_medical_cert BOOLEAN       NOT NULL DEFAULT FALSE,
    min_days_notice       INTEGER       NOT NULL DEFAULT 0,
    max_consecutive_days  INTEGER,
    is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
    version               BIGINT        NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, leave_type)
);

CREATE INDEX idx_leave_policies_tenant ON leave_policies (tenant_id);
