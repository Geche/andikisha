package com.andikisha.integration.infrastructure.messaging;

import com.andikisha.events.payroll.PaymentCompletedEvent;
import com.andikisha.events.payroll.PaymentFailedEvent;
import com.andikisha.integration.application.port.IntegrationEventPublisher;
import com.andikisha.integration.domain.model.PaymentTransaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class RabbitIntegrationEventPublisher implements IntegrationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(
            RabbitIntegrationEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitIntegrationEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishPaymentCompleted(PaymentTransaction tx) {
        var event = new PaymentCompletedEvent(
                tx.getTenantId(),
                tx.getPayrollRunId().toString(),
                tx.getPaySlipId().toString(),
                tx.getEmployeeId().toString(),
                tx.getProviderReceipt(),
                tx.getAmount(),
                tx.getPhoneNumber(),
                tx.getPaymentMethod().name()
        );
        rabbitTemplate.convertAndSend("integration.events", "payment.completed", event);
        log.info("Published payment completed for {} receipt {}",
                tx.getEmployeeName(), tx.getProviderReceipt());
    }

    @Override
    public void publishPaymentFailed(PaymentTransaction tx) {
        var event = new PaymentFailedEvent(
                tx.getTenantId(),
                tx.getPayrollRunId().toString(),
                tx.getPaySlipId().toString(),
                tx.getEmployeeId().toString(),
                tx.getEmployeeName(),
                tx.getPaymentMethod().name(),
                tx.getAmount(),
                tx.getErrorCode(),
                tx.getErrorMessage()
        );
        rabbitTemplate.convertAndSend("integration.events", "payment.failed", event);
        log.warn("Published payment failed for {} error: {}",
                tx.getEmployeeName(), tx.getErrorMessage());
    }
}
