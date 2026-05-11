package com.andikisha.auth.infrastructure.messaging;

import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Creates an EMPLOYEE auth user when employee-service provisions a new employee.
 * Initial password is the employee's phone number — the employee portal login page
 * should prompt for a password change on first login.
 */
@Component
public class EmployeeCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeCreatedListener.class);

    private final AuthService authService;

    public EmployeeCreatedListener(AuthService authService) {
        this.authService = authService;
    }

    @RabbitListener(queues = RabbitMqConfig.EMPLOYEE_CREATED_QUEUE)
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        if (event.getEmail() == null || event.getEmail().isBlank()) {
            log.warn("EmployeeCreatedEvent missing email for tenant={} employee={} — skipping user creation",
                    event.getTenantId(), event.getEmployeeId());
            return;
        }

        try {
            // Use phone number as the initial password so employees can log in immediately.
            // The employee portal should prompt for a password change on first login.
            String initialPassword = event.getPhoneNumber() != null
                    ? event.getPhoneNumber()
                    : event.getEmployeeNumber();

            authService.provisionEmployeeUser(
                    event.getTenantId(),
                    event.getEmail(),
                    event.getPhoneNumber(),
                    initialPassword,
                    event.getEmployeeId());

            log.info("Created EMPLOYEE auth user for tenant={} employee={} email={}",
                    event.getTenantId(), event.getEmployeeId(), event.getEmail());
        } catch (Exception ex) {
            log.error("Failed to create auth user for employee={} tenant={}",
                    event.getEmployeeId(), event.getTenantId(), ex);
        }
    }
}
