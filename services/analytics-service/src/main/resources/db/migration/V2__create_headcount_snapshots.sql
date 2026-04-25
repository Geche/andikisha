CREATE TABLE headcount_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           VARCHAR(50) NOT NULL,
    snapshot_date       DATE NOT NULL,
    total_active        INTEGER NOT NULL DEFAULT 0,
    total_on_probation  INTEGER NOT NULL DEFAULT 0,
    total_on_leave      INTEGER NOT NULL DEFAULT 0,
    total_suspended     INTEGER NOT NULL DEFAULT 0,
    total_terminated    INTEGER NOT NULL DEFAULT 0,
    new_hires           INTEGER NOT NULL DEFAULT 0,
    exits               INTEGER NOT NULL DEFAULT 0,
    permanent_count     INTEGER NOT NULL DEFAULT 0,
    contract_count      INTEGER NOT NULL DEFAULT 0,
    casual_count        INTEGER NOT NULL DEFAULT 0,
    intern_count        INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, snapshot_date)
);

CREATE INDEX idx_headcount_tenant ON headcount_snapshots(tenant_id);
CREATE INDEX idx_headcount_date ON headcount_snapshots(tenant_id, snapshot_date);