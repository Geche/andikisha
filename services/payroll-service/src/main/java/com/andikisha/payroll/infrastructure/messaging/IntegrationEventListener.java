package com.andikisha.payroll.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.payroll.PaymentCompletedEvent;
import com.andikisha.events.payroll.PaymentFailedEvent;
import com.andikisha.events.payroll.PaymentsCompletedEvent;
import com.andikisha.payroll.application.service.PayrollService;
import com.andikisha.payroll.infrastructure.config.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IntegrationEventListener {

    private static final Logger log = LoggerFactory.getLogger(IntegrationEventListener.class);

    private final PayrollService payrollService;

    public IntegrationEventListener(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @RabbitListener(queues = RabbitMqConfig.PAYROLL_PAYMENT_EVENTS_QUEUE)
    public void onPaymentsCompleted(PaymentsCompletedEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            log.info("Payments completed for run {} — {}/{} successful, KES {} disbursed",
                    event.getPayrollRunId(),
                    event.getCountSuccessful(),
                    event.getCountSuccessful() + event.getCountFailed(),
                    event.getTotalDisbursed());
            payrollService.completePayrollRun(
                    UUID.fromString(event.getPayrollRunId()),
                    event.getCountFailed());
        } catch (Exception e) {
            log.error("Failed to complete payroll run {}: {}",
                    event.getPayrollRunId(), e.getMessage());
            throw e;
        } finally {
            TenantContext.clear();
        }
    }

    @RabbitListener(queues = RabbitMqConfig.PAYROLL_PER_PAYMENT_QUEUE)
    public void onPerPaymentEvent(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof PaymentCompletedEvent e) {
                payrollService.updatePaySlipPaymentStatus(
                        UUID.fromString(e.getPaySlipId()),
                        event.getTenantId(),
                        true,
                        e.getProviderReceipt());
            } else if (event instanceof PaymentFailedEvent e) {
                payrollService.updatePaySlipPaymentStatus(
                        UUID.fromString(e.getPaySlipId()),
                        event.getTenantId(),
                        false,
                        null);
            }
        } catch (Exception ex) {
            log.error("Failed to update payslip for event {}: {}", event.getEventType(), ex.getMessage());
            throw ex;
        } finally {
            TenantContext.clear();
        }
    }
}
