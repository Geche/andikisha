CREATE TABLE users (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             VARCHAR(50)  NOT NULL,
    email                 VARCHAR(255) NOT NULL,
    phone_number          VARCHAR(20)  NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    role                  VARCHAR(30)  NOT NULL DEFAULT 'EMPLOYEE',
    employee_id           UUID,
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login            TIMESTAMP,
    failed_login_attempts INTEGER      NOT NULL DEFAULT 0,
    locked_until          TIMESTAMP,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    version               BIGINT       NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, phone_number)
);

CREATE INDEX idx_users_tenant   ON users (tenant_id);
CREATE INDEX idx_users_email    ON users (tenant_id, email);
CREATE INDEX idx_users_phone    ON users (tenant_id, phone_number);
CREATE INDEX idx_users_employee ON users (tenant_id, employee_id);
