package com.andikisha.payroll.infrastructure.messaging;

import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.events.payroll.PayrollCalculatedEvent;
import com.andikisha.events.payroll.PayrollInitiatedEvent;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import com.andikisha.payroll.application.port.PayrollEventPublisher;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.infrastructure.config.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class RabbitPayrollEventPublisher implements PayrollEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitPayrollEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitPayrollEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishPayrollInitiated(PayrollRun run) {
        var event = new PayrollInitiatedEvent(
                run.getTenantId(), run.getId().toString(),
                run.getPeriod(), run.getEmployeeCount(), run.getInitiatedBy());
        sendAfterCommit(RabbitMqConfig.PAYROLL_EXCHANGE, "payroll.initiated", event);
        log.info("Queued payroll.initiated event for period {}", run.getPeriod());
    }

    @Override
    public void publishPayrollCalculated(PayrollRun run) {
        var event = new PayrollCalculatedEvent(
                run.getTenantId(), run.getId().toString(),
                run.getPeriod(), run.getEmployeeCount(),
                run.getTotalGross(), run.getTotalNet());
        sendAfterCommit(RabbitMqConfig.PAYROLL_EXCHANGE, "payroll.calculated", event);
        log.info("Queued payroll.calculated event for period {}", run.getPeriod());
    }

    @Override
    public void publishPayrollApproved(PayrollRun run) {
        var event = new PayrollApprovedEvent(
                run.getTenantId(), run.getId().toString(),
                run.getPeriod(), run.getEmployeeCount(),
                run.getTotalGross(), run.getTotalNet(), run.getApprovedBy());
        sendAfterCommit(RabbitMqConfig.PAYROLL_EXCHANGE, "payroll.approved", event);
        log.info("Queued payroll.approved event for period {}", run.getPeriod());
    }

    @Override
    public void publishPayrollProcessed(PayrollRun run) {
        var event = new PayrollProcessedEvent(
                run.getTenantId(), run.getId().toString(), run.getPeriod());
        sendAfterCommit(RabbitMqConfig.PAYROLL_EXCHANGE, "payroll.processed", event);
        log.info("Queued payroll.processed event for period {}", run.getPeriod());
    }

    /**
     * Defers the RabbitMQ send until after the surrounding transaction commits.
     * If no transaction is active (e.g. called from a test or non-transactional context),
     * sends immediately so the event is never silently dropped.
     */
    private void sendAfterCommit(String exchange, String routingKey, Object event) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    doSend(exchange, routingKey, event);
                }
            });
        } else {
            doSend(exchange, routingKey, event);
        }
    }

    private void doSend(String exchange, String routingKey, Object event) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
        } catch (Exception e) {
            log.error("Failed to publish event [{}] to {}/{}: {}",
                    event.getClass().getSimpleName(), exchange, routingKey, e.getMessage(), e);
        }
    }
}
