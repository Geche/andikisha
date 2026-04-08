CREATE TABLE employees (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                    VARCHAR(50) NOT NULL,
    employee_number              VARCHAR(20) NOT NULL,
    first_name                   VARCHAR(100) NOT NULL,
    last_name                    VARCHAR(100) NOT NULL,
    national_id                  VARCHAR(20) NOT NULL,
    phone_number                 VARCHAR(20) NOT NULL,
    email                        VARCHAR(255),
    kra_pin                      VARCHAR(20) NOT NULL,
    nhif_number                  VARCHAR(20) NOT NULL,
    nssf_number                  VARCHAR(20) NOT NULL,
    date_of_birth                DATE,
    gender                       VARCHAR(10),
    department_id                UUID REFERENCES departments(id),
    position_id                  UUID REFERENCES positions(id),
    reporting_to                 UUID,
    employment_type              VARCHAR(20) NOT NULL DEFAULT 'PERMANENT',
    status                       VARCHAR(20) NOT NULL DEFAULT 'ON_PROBATION',
    basic_salary_amount          NUMERIC(15,2) NOT NULL,
    salary_currency              VARCHAR(3) NOT NULL DEFAULT 'KES',
    housing_allowance_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
    housing_allowance_currency   VARCHAR(3) NOT NULL DEFAULT 'KES',
    transport_allowance_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
    transport_allowance_currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    medical_allowance_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
    medical_allowance_currency   VARCHAR(3) NOT NULL DEFAULT 'KES',
    other_allowances_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
    other_allowances_currency    VARCHAR(3) NOT NULL DEFAULT 'KES',
    hire_date                    DATE NOT NULL,
    probation_end_date           DATE,
    termination_date             DATE,
    termination_reason           TEXT,
    bank_name                    VARCHAR(100),
    bank_account_number          VARCHAR(50),
    bank_branch                  VARCHAR(100),
    created_at                   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMP NOT NULL DEFAULT NOW(),
    version                      BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, national_id),
    UNIQUE(tenant_id, employee_number),
    UNIQUE(tenant_id, phone_number)
);

CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_tenant_status ON employees(tenant_id, status);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_phone ON employees(phone_number);
CREATE INDEX idx_employees_email ON employees(tenant_id, email);