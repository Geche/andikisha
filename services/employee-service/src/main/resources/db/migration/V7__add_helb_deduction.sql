ALTER TABLE employees
    ADD COLUMN helb_monthly_deduction_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
    ADD COLUMN helb_monthly_deduction_currency VARCHAR(3)    NOT NULL DEFAULT 'KES';
