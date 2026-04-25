package com.andikisha.analytics.infrastructure.messaging;

import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.repository.HeadcountSnapshotRepository;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class EmployeeEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeEventListener.class);
    private final HeadcountSnapshotRepository repository;

    public EmployeeEventListener(HeadcountSnapshotRepository repository) {
        this.repository = repository;
    }

    @RabbitListener(queues = "analytics.employee-events")
    @Transactional
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case EmployeeCreatedEvent e -> {
                    HeadcountSnapshot snapshot = getOrCreate(
                            e.getTenantId(), LocalDate.now());
                    snapshot.incrementNewHires();
                    // Employment type is not available in EmployeeCreatedEvent;
                    // defaulting to PERMANENT until the event is enriched.
                    snapshot.incrementByType("PERMANENT");
                    repository.save(snapshot);
                    log.info("Headcount updated: new hire recorded");
                }
                case EmployeeTerminatedEvent e -> {
                    HeadcountSnapshot snapshot = getOrCreate(
                            e.getTenantId(), LocalDate.now());
                    snapshot.incrementExits();
                    snapshot.incrementTerminated();
                    repository.save(snapshot);
                    log.info("Headcount updated: exit recorded");
                }
                default -> log.debug("Ignoring employee event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private HeadcountSnapshot getOrCreate(String tenantId, LocalDate date) {
        return repository.findByTenantIdAndSnapshotDate(tenantId, date)
                .orElseGet(() -> {
                    HeadcountSnapshot s = HeadcountSnapshot.create(tenantId, date);
                    return repository.save(s);
                });
    }
}
