-- Drop the full unique constraint that blocks payroll re-runs after COMPLETED/FAILED/CANCELLED
ALTER TABLE payroll_runs DROP CONSTRAINT IF EXISTS payroll_runs_tenant_id_period_pay_frequency_key;

-- Replace with a partial unique index scoped only to active runs
CREATE UNIQUE INDEX uq_payroll_runs_active
    ON payroll_runs (tenant_id, period, pay_frequency)
    WHERE status NOT IN ('COMPLETED', 'FAILED', 'CANCELLED');
