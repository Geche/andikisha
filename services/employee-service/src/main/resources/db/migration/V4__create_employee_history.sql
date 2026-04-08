CREATE TABLE employee_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50) NOT NULL,
    employee_id     UUID NOT NULL,
    change_type     VARCHAR(50) NOT NULL,
    field_name      VARCHAR(100),
    old_value       VARCHAR(1000),
    new_value       VARCHAR(1000),
    changed_by      VARCHAR(100) NOT NULL,
    changed_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emp_history_tenant_employee ON employee_history(tenant_id, employee_id);
CREATE INDEX idx_emp_history_changed_at ON employee_history(changed_at);