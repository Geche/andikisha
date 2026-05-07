-- V6__add_nita_to_pay_slips.sql
ALTER TABLE pay_slips ADD COLUMN IF NOT EXISTS nita NUMERIC(10,2) NOT NULL DEFAULT 50.00;
