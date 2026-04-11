CREATE TABLE leave_requests (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        VARCHAR(50)   NOT NULL,
    employee_id      UUID          NOT NULL,
    employee_name    VARCHAR(200)  NOT NULL,
    leave_type       VARCHAR(20)   NOT NULL,
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    days             NUMERIC(5,1)  NOT NULL,
    reason           VARCHAR(1000),
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    reviewed_by      UUID,
    reviewer_name    VARCHAR(200),
    reviewed_at      TIMESTAMP,
    rejection_reason VARCHAR(500),
    has_medical_cert BOOLEAN       NOT NULL DEFAULT FALSE,
    attachment_url   VARCHAR(500),
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    version          BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_leave_requests_tenant   ON leave_requests (tenant_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests (tenant_id, employee_id);
CREATE INDEX idx_leave_requests_status   ON leave_requests (tenant_id, status);
CREATE INDEX idx_leave_requests_dates    ON leave_requests (tenant_id, start_date, end_date);
