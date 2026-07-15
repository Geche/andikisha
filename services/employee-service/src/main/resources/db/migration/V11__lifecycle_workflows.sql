-- V11: Employee lifecycle (onboarding / offboarding) workflow module.
-- Four new tables plus the D2 archive column on employees. UUID references only
-- (employee_id carries no FK — no cross-aggregate/cross-service FKs).

CREATE TABLE lifecycle_workflow_template (
    id                          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   VARCHAR(50)  NOT NULL,
    type                        VARCHAR(20)  NOT NULL,
    name                        VARCHAR(150) NOT NULL,
    active                      BOOLEAN      NOT NULL DEFAULT TRUE,
    applicable_employment_types VARCHAR(200),
    created_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    version                     BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_lct_type CHECK (type IN ('ONBOARDING','OFFBOARDING'))
);

CREATE INDEX idx_lct_tenant_type ON lifecycle_workflow_template (tenant_id, type);

CREATE TABLE lifecycle_task_definition (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50)  NOT NULL,
    template_id     UUID         NOT NULL REFERENCES lifecycle_workflow_template(id) ON DELETE CASCADE,
    order_index     INTEGER      NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    assignee_role   VARCHAR(20)  NOT NULL,
    completion_type VARCHAR(20)  NOT NULL,
    due_offset_days INTEGER,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_ltd_role CHECK (assignee_role IN ('HR_OFFICER','LINE_MANAGER','EMPLOYEE','ADMIN','HR_MANAGER')),
    CONSTRAINT chk_ltd_completion CHECK (completion_type IN ('MANUAL','DOCUMENT_UPLOAD'))
);

CREATE INDEX idx_ltd_template ON lifecycle_task_definition (template_id);

CREATE TABLE lifecycle_workflow_instance (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    VARCHAR(50)  NOT NULL,
    employee_id  UUID         NOT NULL,
    template_id  UUID         NOT NULL,
    type         VARCHAR(20)  NOT NULL,
    status       VARCHAR(20)  NOT NULL,
    started_at   TIMESTAMP    NOT NULL,
    completed_at TIMESTAMP,
    initiated_by VARCHAR(100) NOT NULL,
    system_note  VARCHAR(500),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    version      BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_lwi_type CHECK (type IN ('ONBOARDING','OFFBOARDING')),
    CONSTRAINT chk_lwi_status CHECK (status IN ('PENDING','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED'))
);

CREATE INDEX idx_lwi_tenant_employee ON lifecycle_workflow_instance (tenant_id, employee_id);
CREATE INDEX idx_lwi_tenant_status   ON lifecycle_workflow_instance (tenant_id, status);
CREATE INDEX idx_lwi_tenant_type     ON lifecycle_workflow_instance (tenant_id, type);

CREATE TABLE lifecycle_task (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50)  NOT NULL,
    instance_id     UUID         NOT NULL REFERENCES lifecycle_workflow_instance(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    assignee_role   VARCHAR(20)  NOT NULL,
    due_date        DATE,
    status          VARCHAR(20)  NOT NULL,
    completion_type VARCHAR(20)  NOT NULL,
    completed_by    VARCHAR(100),
    completed_at    TIMESTAMP,
    document_id     UUID,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_lt_role CHECK (assignee_role IN ('HR_OFFICER','LINE_MANAGER','EMPLOYEE','ADMIN','HR_MANAGER')),
    CONSTRAINT chk_lt_status CHECK (status IN ('OPEN','DONE','SKIPPED')),
    CONSTRAINT chk_lt_completion CHECK (completion_type IN ('MANUAL','DOCUMENT_UPLOAD'))
);

CREATE INDEX idx_lt_instance     ON lifecycle_task (instance_id);
CREATE INDEX idx_lt_tenant_status ON lifecycle_task (tenant_id, status);

-- D2: archive model. Offboarding completion stamps this; archived employees are
-- excluded from the default roster list.
ALTER TABLE employees ADD COLUMN archived_at TIMESTAMP;

-- Backfill: employees already TERMINATED before this migration must archive too. Otherwise
-- pre-existing terminated rows linger in the default roster while newly-terminated ones drop
-- off, recreating the offboarding asymmetry as a data problem. Use the stored termination date
-- where present (a DATE → midnight), else the migration time.
UPDATE employees
   SET archived_at = COALESCE(termination_date::timestamp, NOW())
 WHERE status = 'TERMINATED'
   AND archived_at IS NULL;
