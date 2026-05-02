-- V3__make_helb_not_null.sql
-- Service: payroll-service
-- Description: Make helb NOT NULL. All existing rows already have DEFAULT 0 from V2,
--              so this ALTER is safe with no data loss.

UPDATE pay_slips SET helb = 0 WHERE helb IS NULL;
ALTER TABLE pay_slips ALTER COLUMN helb SET NOT NULL;
