-- Payroll trend queries: GROUP BY period for a tenant
CREATE INDEX IF NOT EXISTS idx_payroll_summary_tenant_period
    ON payroll_summaries (tenant_id, period DESC);

-- Headcount trend: snapshots over time
CREATE INDEX IF NOT EXISTS idx_headcount_snapshot_tenant_date
    ON headcount_snapshots (tenant_id, snapshot_date DESC);

-- Leave analytics: breakdown by leave type and period
CREATE INDEX IF NOT EXISTS idx_leave_analytics_tenant_period_type
    ON leave_analytics (tenant_id, period DESC, leave_type);

-- Leave analytics: trend by leave type
CREATE INDEX IF NOT EXISTS idx_leave_analytics_tenant_type_period
    ON leave_analytics (tenant_id, leave_type, period DESC);
