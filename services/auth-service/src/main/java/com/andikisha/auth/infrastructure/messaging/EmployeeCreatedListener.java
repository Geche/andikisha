package com.andikisha.auth.infrastructure.messaging;

import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.infrastructure.config.RabbitMqConfig;
import com.andikisha.common.util.PasswordGenerator;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EmployeeCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeCreatedListener.class);

    private final AuthService authService;
    private final AuthEventPublisher eventPublisher;

    public EmployeeCreatedListener(AuthService authService, AuthEventPublisher eventPublisher) {
        this.authService = authService;
        this.eventPublisher = eventPublisher;
    }

    @RabbitListener(queues = RabbitMqConfig.EMPLOYEE_CREATED_QUEUE)
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        com.andikisha.common.tenant.TenantContext.setTenantId(event.getTenantId());
        try {
            if (event.getEmail() == null || event.getEmail().isBlank()) {
                log.warn("EmployeeCreatedEvent missing email for tenant={} employee={} — skipping user creation",
                        event.getTenantId(), event.getEmployeeId());
                return;
            }

            String tempPassword = com.andikisha.common.util.PasswordGenerator.generate();

            authService.provisionEmployeeUser(
                    event.getTenantId(),
                    event.getEmail(),
                    event.getPhoneNumber(),
                    tempPassword,
                    event.getEmployeeId());

            eventPublisher.publishEmployeeUserProvisioned(
                    event.getTenantId(),
                    event.getEmployeeId(),
                    event.getEmail(),
                    event.getFirstName(),
                    event.getLastName(),
                    event.getEmployeeNumber(),
                    tempPassword);

            log.info("Provisioned EMPLOYEE auth user for tenant={} employee={} email={}",
                    event.getTenantId(), event.getEmployeeId(), event.getEmail());
        } catch (Exception ex) {
            log.error("Failed to provision auth user for employee={} tenant={}",
                    event.getEmployeeId(), event.getTenantId(), ex);
        } finally {
            com.andikisha.common.tenant.TenantContext.clear();
        }
    }
}
