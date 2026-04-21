CREATE TABLE payment_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           VARCHAR(50) NOT NULL,
    payroll_run_id      UUID NOT NULL,
    pay_slip_id         UUID NOT NULL,
    employee_id         UUID NOT NULL,
    employee_name       VARCHAR(200),
    payment_method      VARCHAR(20) NOT NULL,
    phone_number        VARCHAR(20),
    bank_account        VARCHAR(50),
    amount              NUMERIC(15,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'KES',
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    external_reference  VARCHAR(100),
    provider_receipt    VARCHAR(100),
    conversation_id     VARCHAR(100),
    error_code          VARCHAR(20),
    error_message       VARCHAR(1000),
    submitted_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_payment_transactions_tenant
    ON payment_transactions(tenant_id);
CREATE INDEX idx_payment_transactions_payroll_run
    ON payment_transactions(tenant_id, payroll_run_id);
CREATE INDEX idx_payment_transactions_status
    ON payment_transactions(tenant_id, status);
CREATE INDEX idx_payment_transactions_conversation
    ON payment_transactions(conversation_id);
