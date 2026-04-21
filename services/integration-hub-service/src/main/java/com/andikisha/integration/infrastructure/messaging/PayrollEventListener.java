package com.andikisha.integration.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.integration.application.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);
    private final PaymentService paymentService;

    public PayrollEventListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @RabbitListener(queues = "integration.payroll-events")
    public void onPayrollApproved(PayrollApprovedEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            log.info("Payroll approved event received for run {} tenant {}",
                    event.getPayrollRunId(), event.getTenantId());
            paymentService.processBatchPayments(
                    event.getTenantId(),
                    UUID.fromString(event.getPayrollRunId()));
        } catch (Exception e) {
            log.error("Failed to process disbursement for payroll run {}: {}",
                    event.getPayrollRunId(), e.getMessage());
            throw e;
        } finally {
            TenantContext.clear();
        }
    }
}
