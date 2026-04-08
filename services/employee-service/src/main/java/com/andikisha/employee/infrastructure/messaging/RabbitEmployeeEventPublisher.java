package com.andikisha.employee.infrastructure.messaging;

import com.andikisha.employee.application.port.EmployeeEventPublisher;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import com.andikisha.events.employee.EmployeeUpdatedEvent;
import com.andikisha.events.employee.SalaryChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;

@Component
public class RabbitEmployeeEventPublisher implements EmployeeEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitEmployeeEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public RabbitEmployeeEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishEmployeeCreated(Employee employee) {
        var event = new EmployeeCreatedEvent(
                employee.getTenantId(),
                employee.getId().toString(),
                employee.getEmployeeNumber(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhoneNumber(),
                employee.getDepartment() != null ? employee.getDepartment().getId().toString() : null,
                employee.getSalaryStructure().getBasicSalary().getAmount(),
                employee.getSalaryStructure().getBasicSalary().getCurrency()
        );
        sendAfterCommit(RabbitMqConfig.EMPLOYEE_EXCHANGE, "employee.created", event,
                employee.getEmployeeNumber());
    }

    @Override
    public void publishEmployeeUpdated(Employee employee, String updatedBy) {
        var event = new EmployeeUpdatedEvent(
                employee.getTenantId(), employee.getId().toString(), updatedBy);
        sendAfterCommit(RabbitMqConfig.EMPLOYEE_EXCHANGE, "employee.updated", event,
                employee.getEmployeeNumber());
    }

    @Override
    public void publishEmployeeTerminated(Employee employee, String reason, String terminatedBy) {
        var event = new EmployeeTerminatedEvent(
                employee.getTenantId(), employee.getId().toString(), reason, terminatedBy);
        sendAfterCommit(RabbitMqConfig.EMPLOYEE_EXCHANGE, "employee.terminated", event,
                employee.getEmployeeNumber());
    }

    @Override
    public void publishSalaryChanged(Employee employee, BigDecimal oldSalary,
                                     BigDecimal newSalary, String changedBy) {
        var event = new SalaryChangedEvent(
                employee.getTenantId(), employee.getId().toString(),
                oldSalary, newSalary,
                employee.getSalaryStructure().getBasicSalary().getCurrency(), changedBy);
        sendAfterCommit(RabbitMqConfig.EMPLOYEE_EXCHANGE, "employee.salary_changed", event,
                employee.getEmployeeNumber());
    }

    /**
     * Defers the RabbitMQ send until after the surrounding database transaction
     * commits.  If no transaction is active the message is sent immediately.
     * This prevents phantom events when the DB transaction rolls back.
     */
    private void sendAfterCommit(String exchange, String routingKey,
                                 Object event, String employeeNumber) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            doSend(exchange, routingKey, event, employeeNumber);
                        }
                    });
        } else {
            doSend(exchange, routingKey, event, employeeNumber);
        }
    }

    private void doSend(String exchange, String routingKey, Object event, String employeeNumber) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("Published {} for employee {}", routingKey, employeeNumber);
        } catch (Exception e) {
            log.error("Failed to publish {} for employee {}", routingKey, employeeNumber, e);
        }
    }
}
