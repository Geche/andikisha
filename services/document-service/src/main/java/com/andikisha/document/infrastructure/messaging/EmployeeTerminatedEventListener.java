package com.andikisha.document.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.service.CertificateOfServiceGenerator;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * Consumes the {@code document.employee-events} queue (bound to {@code employee.terminated}) and
 * triggers Certificate of Service generation — Kenya Employment Act §52. Before this listener the
 * queue was declared and bound but had no consumer, so termination events accumulated unprocessed.
 */
@Component
public class EmployeeTerminatedEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeTerminatedEventListener.class);

    private final CertificateOfServiceGenerator certificateGenerator;

    public EmployeeTerminatedEventListener(CertificateOfServiceGenerator certificateGenerator) {
        this.certificateGenerator = certificateGenerator;
    }

    @RabbitListener(queues = "document.employee-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof EmployeeTerminatedEvent e) {
                LocalDate terminationDate = event.getTimestamp() != null
                        ? event.getTimestamp().atZone(ZoneOffset.UTC).toLocalDate()
                        : null;
                log.info("Dispatching certificate of service generation for employee {}", e.getEmployeeId());
                certificateGenerator.generateAsync(e.getTenantId(), e.getEmployeeId(), terminationDate);
            } else {
                log.debug("Ignoring non-termination event on document.employee-events: {}",
                        event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }
}
