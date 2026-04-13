CREATE TABLE tax_brackets (
                              id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              tenant_id       VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
                              country         VARCHAR(5) NOT NULL,
                              band_number     INTEGER NOT NULL,
                              lower_bound     NUMERIC(15,2) NOT NULL,
                              upper_bound     NUMERIC(15,2),
                              rate            NUMERIC(5,4) NOT NULL,
                              effective_from  DATE NOT NULL,
                              effective_to    DATE,
                              is_active       BOOLEAN NOT NULL DEFAULT TRUE,
                              created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                              updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
                              version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_tax_brackets_country ON tax_brackets(country, is_active);
CREATE INDEX idx_tax_brackets_effective ON tax_brackets(country, effective_from);