package com.andikisha.leave.infrastructure.messaging;

import com.andikisha.events.leave.LeaveApprovedEvent;
import com.andikisha.events.leave.LeaveRejectedEvent;
import com.andikisha.events.leave.LeaveRequestedEvent;
import com.andikisha.events.leave.LeaveReversedEvent;
import com.andikisha.leave.application.port.LeaveEventPublisher;
import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.infrastructure.config.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class RabbitLeaveEventPublisher implements LeaveEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitLeaveEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitLeaveEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishLeaveRequested(LeaveRequest request) {
        var event = new LeaveRequestedEvent(
                request.getTenantId(),
                request.getId().toString(),
                request.getEmployeeId().toString(),
                request.getLeaveType().name(),
                request.getStartDate(),
                request.getEndDate(),
                request.getDays()
        );
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitTemplate.convertAndSend(RabbitMqConfig.LEAVE_EXCHANGE, "leave.requested", event);
                log.info("Published leave requested for {}", request.getEmployeeName());
            }
        });
    }

    @Override
    public void publishLeaveApproved(LeaveRequest request) {
        var event = new LeaveApprovedEvent(
                request.getTenantId(),
                request.getId().toString(),
                request.getEmployeeId().toString(),
                request.getLeaveType().name(),
                request.getStartDate(),
                request.getEndDate(),
                request.getDays(),
                request.getReviewedBy().toString()
        );
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitTemplate.convertAndSend(RabbitMqConfig.LEAVE_EXCHANGE, "leave.approved", event);
                log.info("Published leave approved for {}", request.getEmployeeName());
            }
        });
    }

    @Override
    public void publishLeaveRejected(LeaveRequest request) {
        var event = new LeaveRejectedEvent(
                request.getTenantId(),
                request.getId().toString(),
                request.getEmployeeId().toString(),
                request.getLeaveType().name(),
                request.getRejectionReason(),
                request.getReviewedBy().toString()
        );
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitTemplate.convertAndSend(RabbitMqConfig.LEAVE_EXCHANGE, "leave.rejected", event);
                log.info("Published leave rejected for {}", request.getEmployeeName());
            }
        });
    }

    @Override
    public void publishLeaveReversed(LeaveRequest request) {
        var event = new LeaveReversedEvent(
                request.getTenantId(),
                request.getId().toString(),
                request.getEmployeeId().toString(),
                request.getLeaveType().name(),
                request.getDays(),
                request.getRejectionReason(),
                request.getReviewedBy().toString()
        );
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitTemplate.convertAndSend(RabbitMqConfig.LEAVE_EXCHANGE, "leave.reversed", event);
                log.info("Published leave reversed for {}", request.getEmployeeName());
            }
        });
    }
}