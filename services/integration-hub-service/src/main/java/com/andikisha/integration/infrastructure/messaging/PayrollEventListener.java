package com.andikisha.integration.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.integration.application.service.PaymentService;
import com.andikisha.integration.infrastructure.payroll.PayrollServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);

    private final PaymentService paymentService;
    private final PayrollServiceClient payrollClient;

    public PayrollEventListener(PaymentService paymentService,
                                PayrollServiceClient payrollClient) {
        this.paymentService = paymentService;
        this.payrollClient = payrollClient;
    }

    @RabbitListener(queues = "integration.payroll-events")
    public void onPayrollApproved(PayrollApprovedEvent event) {
        String tenantId = event.getTenantId();
        UUID runId = UUID.fromString(event.getPayrollRunId());
        TenantContext.setTenantId(tenantId);
        try {
            log.info("Payroll approved — creating transactions for run {} (tenant {})",
                    runId, tenantId);

            // Fetch payslips from payroll-service and create payment transactions
            List<PayrollServiceClient.PayslipDisbursementInfo> payslips =
                    payrollClient.getPayslipsForRun(tenantId, runId);

            if (payslips.isEmpty()) {
                log.warn("No payslips found for run {} — skipping disbursement", runId);
                return;
            }

            int created = 0;
            for (PayrollServiceClient.PayslipDisbursementInfo slip : payslips) {
                paymentService.createMpesaTransaction(
                        tenantId,
                        runId,
                        UUID.fromString(slip.id()),
                        UUID.fromString(slip.employeeId()),
                        slip.employeeName(),
                        slip.paymentPhone(),
                        slip.netPay(),
                        slip.currency() != null ? slip.currency() : "KES"
                );
                created++;
            }

            log.info("Created {} payment transactions for run {}", created, runId);
            paymentService.processBatchPayments(tenantId, runId);

        } catch (Exception e) {
            log.error("Failed to create/process disbursement for payroll run {}: {}",
                    runId, e.getMessage(), e);
            throw e;
        } finally {
            TenantContext.clear();
        }
    }
}
