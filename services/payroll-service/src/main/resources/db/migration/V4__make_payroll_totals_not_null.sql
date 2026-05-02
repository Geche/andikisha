-- V4__make_payroll_totals_not_null.sql
-- Service: payroll-service
-- Description: Enforce NOT NULL on all aggregate total columns in payroll_runs.
--              All existing rows have DEFAULT 0 values, so this is safe.

UPDATE payroll_runs SET
    total_gross            = COALESCE(total_gross, 0),
    total_basic            = COALESCE(total_basic, 0),
    total_allowances       = COALESCE(total_allowances, 0),
    total_paye             = COALESCE(total_paye, 0),
    total_nssf             = COALESCE(total_nssf, 0),
    total_shif             = COALESCE(total_shif, 0),
    total_housing_levy     = COALESCE(total_housing_levy, 0),
    total_other_deductions = COALESCE(total_other_deductions, 0),
    total_net              = COALESCE(total_net, 0);

ALTER TABLE payroll_runs
    ALTER COLUMN total_gross            SET NOT NULL,
    ALTER COLUMN total_basic            SET NOT NULL,
    ALTER COLUMN total_allowances       SET NOT NULL,
    ALTER COLUMN total_paye             SET NOT NULL,
    ALTER COLUMN total_nssf             SET NOT NULL,
    ALTER COLUMN total_shif             SET NOT NULL,
    ALTER COLUMN total_housing_levy     SET NOT NULL,
    ALTER COLUMN total_other_deductions SET NOT NULL,
    ALTER COLUMN total_net              SET NOT NULL;
