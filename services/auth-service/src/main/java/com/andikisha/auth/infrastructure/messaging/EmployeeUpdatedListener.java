package com.andikisha.auth.infrastructure.messaging;

import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.infrastructure.config.RabbitMqConfig;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.employee.EmployeeUpdatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * AUTH-007: when an employee is updated (e.g. renamed via the HR edit form), re-resolve
 * and refresh the linked auth user's {@code display_name}. The {@link EmployeeUpdatedEvent}
 * carries no name fields, so {@link AuthService#syncDisplayNameFromEmployee} re-resolves
 * via gRPC (Option A — no event-contract change). A failure here is non-fatal: the name
 * stays at its previous value and self-heals on the next update; the read path falls back
 * to email and never depends on freshness.
 */
@Component
public class EmployeeUpdatedListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeUpdatedListener.class);

    private final AuthService authService;

    public EmployeeUpdatedListener(AuthService authService) {
        this.authService = authService;
    }

    @RabbitListener(queues = RabbitMqConfig.EMPLOYEE_UPDATED_QUEUE)
    public void onEmployeeUpdated(EmployeeUpdatedEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            authService.syncDisplayNameFromEmployee(event.getTenantId(), event.getEmployeeId());
        } catch (Exception ex) {
            log.error("Failed to sync display_name for employee={} tenant={}",
                    event.getEmployeeId(), event.getTenantId(), ex);
        } finally {
            TenantContext.clear();
        }
    }
}
