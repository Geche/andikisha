-- Audit H4: exactly one payment transaction per payslip per payroll run.
--
-- PayrollEventListener.createMpesaTransaction did an unconditional insert with no idempotency,
-- and the table had only non-unique indexes on (tenant_id, payroll_run_id). Re-processing a
-- PayrollApprovedEvent — a manual replay, a DLQ re-drive, or a second approval — created a second
-- full set of payment rows and disbursed the entire run again. This constraint is the hard
-- guarantee; PaymentService.createMpesaTransaction/createBankTransaction also skip-if-exists so the
-- normal re-run path does not trip it.
--
-- Precondition: no duplicate (tenant_id, payroll_run_id, pay_slip_id) rows may exist. In prod the
-- table has never held a real disbursement (M-Pesa runs in sandbox), so it is empty; verify before
-- applying in any environment that has disbursed.
ALTER TABLE payment_transactions
    ADD CONSTRAINT uq_payment_txn_tenant_run_payslip
        UNIQUE (tenant_id, payroll_run_id, pay_slip_id);
