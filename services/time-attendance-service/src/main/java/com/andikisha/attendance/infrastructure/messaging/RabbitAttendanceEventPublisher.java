package com.andikisha.attendance.infrastructure.messaging;

import com.andikisha.attendance.application.port.AttendanceEventPublisher;
import com.andikisha.attendance.domain.model.AttendanceRecord;
import com.andikisha.events.attendance.ClockInEvent;
import com.andikisha.events.attendance.ClockOutEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class RabbitAttendanceEventPublisher implements AttendanceEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitAttendanceEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitAttendanceEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishClockIn(AttendanceRecord record) {
        var event = new ClockInEvent(
                record.getTenantId(),
                record.getEmployeeId().toString(),
                record.getClockIn(),
                record.getClockInSource().name()
        );
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitTemplate.convertAndSend("attendance.events", "attendance.clock_in", event);
                log.info("Published clock-in for employee {}", record.getEmployeeId());
            }
        });
    }

    @Override
    public void publishClockOut(AttendanceRecord record) {
        var event = new ClockOutEvent(
                record.getTenantId(),
                record.getEmployeeId().toString(),
                record.getClockOut(),
                record.getHoursWorked()
        );
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                rabbitTemplate.convertAndSend("attendance.events", "attendance.clock_out", event);
                log.info("Published clock-out for employee {}", record.getEmployeeId());
            }
        });
    }
}