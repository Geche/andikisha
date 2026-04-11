package com.andikisha.payroll.application.port;

import com.andikisha.payroll.domain.model.PayrollRun;

public interface PayrollEventPublisher {

    void publishPayrollInitiated(PayrollRun run);

    void publishPayrollCalculated(PayrollRun run);

    void publishPayrollApproved(PayrollRun run);

    void publishPayrollProcessed(PayrollRun run);
}