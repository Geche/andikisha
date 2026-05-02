-- KRA PINs must be unique per tenant (Kenyan tax compliance)
CREATE UNIQUE INDEX IF NOT EXISTS uidx_employee_tenant_kra_pin
    ON employees (tenant_id, kra_pin)
    WHERE kra_pin IS NOT NULL;
