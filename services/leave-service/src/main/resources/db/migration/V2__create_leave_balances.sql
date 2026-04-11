CREATE TABLE leave_balances (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    VARCHAR(50)   NOT NULL,
    employee_id  UUID          NOT NULL,
    leave_type   VARCHAR(20)   NOT NULL,
    year         INTEGER       NOT NULL,
    accrued      NUMERIC(5,1)  NOT NULL DEFAULT 0,
    used         NUMERIC(5,1)  NOT NULL DEFAULT 0,
    carried_over NUMERIC(5,1)  NOT NULL DEFAULT 0,
    frozen       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    version      BIGINT        NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, employee_id, leave_type, year)
);

CREATE INDEX idx_leave_balances_employee ON leave_balances (tenant_id, employee_id, year);
