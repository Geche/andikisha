CREATE TABLE pay_slips (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50)   NOT NULL,
    payroll_run_id          UUID          NOT NULL REFERENCES payroll_runs (id) ON DELETE CASCADE,
    employee_id             UUID          NOT NULL,
    employee_number         VARCHAR(20)   NOT NULL,
    employee_name           VARCHAR(200)  NOT NULL,
    basic_pay               NUMERIC(15,2) NOT NULL,
    housing_allowance       NUMERIC(15,2) NOT NULL DEFAULT 0,
    transport_allowance     NUMERIC(15,2) NOT NULL DEFAULT 0,
    medical_allowance       NUMERIC(15,2) NOT NULL DEFAULT 0,
    other_allowances        NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_allowances        NUMERIC(15,2) NOT NULL DEFAULT 0,
    gross_pay               NUMERIC(15,2) NOT NULL,
    paye                    NUMERIC(15,2) NOT NULL,
    nssf_employee           NUMERIC(15,2) NOT NULL,
    nssf_employer           NUMERIC(15,2) NOT NULL,
    shif                    NUMERIC(15,2) NOT NULL,
    housing_levy_employee   NUMERIC(15,2) NOT NULL,
    housing_levy_employer   NUMERIC(15,2) NOT NULL,
    helb                    NUMERIC(15,2) DEFAULT 0,
    other_deductions        NUMERIC(15,2) NOT NULL DEFAULT 0,
    personal_relief         NUMERIC(15,2) NOT NULL,
    insurance_relief        NUMERIC(15,2) NOT NULL,
    total_deductions        NUMERIC(15,2) NOT NULL,
    net_pay                 NUMERIC(15,2) NOT NULL,
    currency                VARCHAR(3)    NOT NULL DEFAULT 'KES',
    payment_status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    mpesa_receipt           VARCHAR(50),
    payment_phone           VARCHAR(20),
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    version                 BIGINT        NOT NULL DEFAULT 0
);

ALTER TABLE pay_slips
    ADD CONSTRAINT uq_payslips_run_employee UNIQUE (payroll_run_id, employee_id);

CREATE INDEX idx_payslips_run      ON pay_slips (payroll_run_id);
CREATE INDEX idx_payslips_tenant   ON pay_slips (tenant_id);
CREATE INDEX idx_payslips_employee ON pay_slips (tenant_id, employee_id);
CREATE INDEX idx_payslips_payment  ON pay_slips (payment_status);
