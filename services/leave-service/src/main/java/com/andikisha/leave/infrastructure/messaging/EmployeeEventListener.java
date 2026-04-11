package com.andikisha.leave.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import com.andikisha.leave.application.service.LeaveBalanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class EmployeeEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeEventListener.class);
    private final LeaveBalanceService balanceService;

    public EmployeeEventListener(LeaveBalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @RabbitListener(queues = "leave.employee-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case EmployeeCreatedEvent e -> {
                    balanceService.initializeForNewEmployee(
                            e.getTenantId(), UUID.fromString(e.getEmployeeId()));
                    log.info("Initialized leave balances for new employee {}", e.getEmployeeId());
                }
                case EmployeeTerminatedEvent e -> {
                    balanceService.freezeForTerminatedEmployee(
                            e.getTenantId(), UUID.fromString(e.getEmployeeId()));
                    log.info("Frozen leave balances for terminated employee {}", e.getEmployeeId());
                }
                default -> log.debug("Ignoring event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }
}