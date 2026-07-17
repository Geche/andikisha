-- V1: Recruitment core schema (W2).
-- Eight tables. UUID references only across services (department_id, position_id, *_employee_id,
-- job_posting_id, requisition_id, pipeline_template_id, *_stage_id are bare UUIDs — NO cross-service
-- FKs). The one within-service FK is pipeline_stage -> pipeline_template ON DELETE CASCADE.
-- Money is stored as _amount NUMERIC(15,2) / _currency VARCHAR(3) pairs; both salary bands nullable.

CREATE TABLE pipeline_template (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(50)  NOT NULL,
    name        VARCHAR(150) NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    version     BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_pt_tenant ON pipeline_template (tenant_id);

CREATE TABLE pipeline_stage (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   VARCHAR(50)  NOT NULL,
    template_id UUID         NOT NULL REFERENCES pipeline_template(id) ON DELETE CASCADE,
    order_index INTEGER      NOT NULL,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    version     BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_ps_category CHECK (category IN ('APPLIED','INTERMEDIATE','OFFER','HIRED','REJECTED'))
);

CREATE INDEX idx_ps_template       ON pipeline_stage (template_id);
CREATE INDEX idx_ps_tenant_template ON pipeline_stage (tenant_id, template_id);

CREATE TABLE job_requisition (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             VARCHAR(50)   NOT NULL,
    title                 VARCHAR(150)  NOT NULL,
    department_id         UUID,
    position_id           UUID,
    employment_type       VARCHAR(20)   NOT NULL,
    salary_min_amount     NUMERIC(15,2),
    salary_min_currency   VARCHAR(3),
    salary_max_amount     NUMERIC(15,2),
    salary_max_currency   VARCHAR(3),
    headcount             INTEGER       NOT NULL DEFAULT 1,
    status                VARCHAR(20)   NOT NULL,
    raised_by_employee_id UUID,
    target_start_date     DATE,
    description           TEXT,
    created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
    version               BIGINT        NOT NULL DEFAULT 0,
    CONSTRAINT chk_jr_employment_type CHECK (employment_type IN ('PERMANENT','CONTRACT','CASUAL','DIRECTOR','INTERN')),
    CONSTRAINT chk_jr_status CHECK (status IN ('DRAFT','OPEN','CLOSED'))
);

CREATE INDEX idx_jr_tenant        ON job_requisition (tenant_id);
CREATE INDEX idx_jr_tenant_status ON job_requisition (tenant_id, status);

CREATE TABLE job_posting (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            VARCHAR(50)  NOT NULL,
    requisition_id       UUID         NOT NULL,
    pipeline_template_id UUID         NOT NULL,
    title                VARCHAR(150) NOT NULL,
    description          TEXT,
    location             VARCHAR(150),
    status               VARCHAR(20)  NOT NULL,
    published_at         TIMESTAMP,
    closing_date         DATE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    version              BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_jp_status CHECK (status IN ('DRAFT','PUBLISHED','CLOSED'))
);

CREATE INDEX idx_jp_tenant          ON job_posting (tenant_id);
CREATE INDEX idx_jp_tenant_template ON job_posting (tenant_id, pipeline_template_id);

CREATE TABLE applicant (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        VARCHAR(50)  NOT NULL,
    job_posting_id   UUID         NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    email            VARCHAR(200) NOT NULL,
    phone_number     VARCHAR(30),
    national_id      VARCHAR(30),
    kra_pin          VARCHAR(30),
    nhif_number      VARCHAR(30),
    nssf_number      VARCHAR(30),
    current_stage_id UUID         NOT NULL,
    source           VARCHAR(100),
    applied_at       TIMESTAMP    NOT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    version          BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_ap_tenant_posting ON applicant (tenant_id, job_posting_id);
CREATE INDEX idx_ap_tenant_stage   ON applicant (tenant_id, current_stage_id);

CREATE TABLE stage_transition (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        VARCHAR(50)   NOT NULL,
    applicant_id     UUID          NOT NULL,
    from_stage_id    UUID,
    to_stage_id      UUID          NOT NULL,
    moved_by_user_id VARCHAR(100)  NOT NULL,
    note             VARCHAR(1000),
    moved_at         TIMESTAMP     NOT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    version          BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_st_tenant_applicant ON stage_transition (tenant_id, applicant_id);

CREATE TABLE interview (
    id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50)  NOT NULL,
    applicant_id            UUID         NOT NULL,
    scheduled_at            TIMESTAMP    NOT NULL,
    interviewer_employee_id UUID         NOT NULL,
    mode                    VARCHAR(20),
    status                  VARCHAR(20)  NOT NULL,
    location                VARCHAR(200),
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    version                 BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT chk_iv_mode CHECK (mode IS NULL OR mode IN ('ONSITE','PHONE','VIDEO')),
    CONSTRAINT chk_iv_status CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED'))
);

CREATE INDEX idx_iv_tenant_applicant   ON interview (tenant_id, applicant_id);
CREATE INDEX idx_iv_tenant_interviewer ON interview (tenant_id, interviewer_employee_id);

CREATE TABLE interview_feedback (
    id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                VARCHAR(50) NOT NULL,
    interview_id             UUID        NOT NULL,
    submitted_by_employee_id UUID        NOT NULL,
    rating                   INTEGER,
    recommendation           VARCHAR(20),
    comments                 TEXT,
    submitted_at             TIMESTAMP   NOT NULL,
    created_at               TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP   NOT NULL DEFAULT NOW(),
    version                  BIGINT      NOT NULL DEFAULT 0,
    CONSTRAINT chk_if_rating CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
    CONSTRAINT chk_if_recommendation CHECK (recommendation IS NULL OR recommendation IN ('STRONG_YES','YES','NO','STRONG_NO'))
);

CREATE INDEX idx_if_tenant_interview ON interview_feedback (tenant_id, interview_id);
